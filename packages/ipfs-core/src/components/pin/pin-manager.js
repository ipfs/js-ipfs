/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const CID = require('cids')
const errCode = require('err-code')
const dagCborLinks = require('dag-cbor-links')
const debug = require('debug')
// const parallelBatch = require('it-parallel-batch')
const first = require('it-first')
const all = require('it-all')
const cbor = require('cbor')
const multibase = require('multibase')
const multicodec = require('multicodec')

// arbitrary limit to the number of concurrent dag operations
// const WALK_DAG_CONCURRENCY_LIMIT = 300
// const IS_PINNED_WITH_TYPE_CONCURRENCY_LIMIT = 300
// const PIN_DS_KEY = new Key('/local/pins')

function invalidPinTypeErr (type) {
  const errMsg = `Invalid type '${type}', must be one of {direct, indirect, recursive, all}`
  return errCode(new Error(errMsg), 'ERR_INVALID_PIN_TYPE')
}

const encoder = multibase.encoding('base32upper')

function cidToKey (cid) {
  return `/${encoder.encode(cid.multihash)}`
}

function keyToMultihash (key) {
  return encoder.decode(key.toString().slice(1))
}

/**
 * @typedef {'direct'|'recursive'|'indirect'} PinType
 * @typedef {PinType|'all'} PinQueryType
 */

const PinTypes = {
  /** @type {'direct'} */
  direct: ('direct'),
  /** @type {'recursive'} */
  recursive: ('recursive'),
  /** @type {'indirect'} */
  indirect: ('indirect'),
  /** @type {'all'} */
  all: ('all')
}

class PinManager {
  /**
   * @param {Object} config
   * @param {import('.').Repo} config.repo
   * @param {import('.').DagReader} config.dagReader
   */
  constructor ({ repo, dagReader }) {
    this.repo = repo
    this.dag = dagReader
    this.log = debug('ipfs:pin')
    this.directPins = new Set()
    this.recursivePins = new Set()
  }

  /**
   * @private
   * @param {CID} cid
   * @param {Object} options
   * @param {boolean} [options.preload]
   */
  async * _walkDag (cid, { preload = false }) {
    const { value: node } = await this.dag.get(cid, { preload })

    if (cid.codec === 'dag-pb') {
      for (const link of node.Links) {
        yield link.Hash
        yield * this._walkDag(link.Hash, { preload })
      }
    } else if (cid.codec === 'dag-cbor') {
      for (const [, childCid] of dagCborLinks(node)) {
        yield childCid
        yield * this._walkDag(childCid, { preload })
      }
    }
  }

  /**
   * @param {CID} cid
   * @param {PinOptions & AbortOptions} [options]
   * @returns {Promise<void>}
   */
  async pinDirectly (cid, options = {}) {
    await this.dag.get(cid, options)

    const pin = {
      depth: 0
    }

    if (cid.version !== 0) {
      pin.version = cid.version
    }

    if (cid.codec !== 'dag-pb') {
      pin.codec = multicodec.getNumber(cid.codec)
    }

    if (options.metadata) {
      pin.metadata = options.metadata
    }

    return this.repo.pins.put(cidToKey(cid), cbor.encode(pin))
  }

  /**
   * @param {CID} cid
   * @param {AbortOptions} [options]
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line require-await
  async unpin (cid, options) {
    return this.repo.pins.delete(cidToKey(cid))
  }

  /**
   * @param {CID} cid
   * @param {PreloadOptions & PinOptions & AbortOptions} [options]
   * @returns {Promise<void>}
   */
  async pinRecursively (cid, options = {}) {
    await this.fetchCompleteDag(cid, options)

    const pin = {
      depth: Infinity
    }

    if (cid.version !== 0) {
      pin.version = cid.version
    }

    if (cid.codec !== 'dag-pb') {
      pin.codec = multicodec.getNumber(cid.codec)
    }

    if (options.metadata) {
      pin.metadata = options.metadata
    }

    await this.repo.pins.put(cidToKey(cid), cbor.encode(pin))
  }

  /**
   * @param {AbortOptions} [options]
   * @returns {AsyncIterable<{ cid: CID, metadata: any }>}
   */
  async * directKeys (options) {
    for await (const entry of this.repo.pins.query({
      filters: [(entry) => {
        const pin = cbor.decode(entry.value)

        return pin.depth === 0
      }]
    })) {
      const pin = cbor.decode(entry.value)
      const version = pin.version || 0
      const codec = pin.codec ? multicodec.getName(pin.codec) : 'dag-pb'
      const multihash = keyToMultihash(entry.key)

      yield {
        cid: new CID(version, codec, multihash),
        metadata: pin.metadata
      }
    }
  }

  /**
   * @param {AbortOptions} [options]
   * @returns {AsyncIterable<{ cid: CID, metadata: any }>}
   */
  async * recursiveKeys (options) {
    for await (const entry of this.repo.pins.query({
      filters: [(entry) => {
        const pin = cbor.decode(entry.value)

        return pin.depth === Infinity
      }]
    })) {
      const pin = cbor.decode(entry.value)
      const version = pin.version || 0
      const codec = pin.codec ? multicodec.getName(pin.codec) : 'dag-pb'
      const multihash = keyToMultihash(entry.key)

      yield {
        cid: new CID(version, codec, multihash),
        metadata: pin.metadata
      }
    }
  }

  /**
   * @param {Object} options
   * @param {boolean} [options.preload]
   */
  async * indirectKeys ({ preload }) {
    for await (const { cid } of this.recursiveKeys()) {
      for await (const childCid of this._walkDag(cid, { preload })) {
        // recursive pins override indirect pins
        const types = [
          PinTypes.recursive
        ]

        const result = await this.isPinnedWithType(childCid, types)

        if (result.pinned) {
          continue
        }

        yield childCid
      }
    }
  }

  /**
   * @param {CID} cid
   * @param {PinQueryType|PinQueryType[]} types
   * @param {AbortOptions} [options]
   */
  async isPinnedWithType (cid, types, options) {
    if (!Array.isArray(types)) {
      types = [types]
    }

    const all = types.includes(PinTypes.all)
    const direct = types.includes(PinTypes.direct)
    const recursive = types.includes(PinTypes.recursive)
    const indirect = types.includes(PinTypes.indirect)

    if (recursive || direct || all) {
      const result = await first(this.repo.pins.query({
        prefix: cidToKey(cid),
        filters: [entry => {
          if (all) {
            return true
          }

          const pin = cbor.decode(entry.value)

          return types.includes(pin.depth === 0 ? PinTypes.direct : PinTypes.recursive)
        }],
        limit: 1
      }))

      if (result) {
        const pin = cbor.decode(result.value)

        return {
          cid,
          pinned: true,
          reason: pin.depth === 0 ? PinTypes.direct : PinTypes.recursive,
          metadata: pin.metadata
        }
      }
    }

    const self = this

    async function * findChild (key, source) {
      for await (const { cid: parentCid } of source) {
        for await (const childCid of self._walkDag(parentCid, { preload: false })) {
          if (childCid.equals(key)) {
            yield parentCid
            return
          }
        }
      }
    }

    if (all || indirect) {
      // indirect (default)
      // check each recursive key to see if multihash is under it

      const parentCid = await first(findChild(cid, this.recursiveKeys()))

      if (parentCid) {
        return {
          cid,
          pinned: true,
          reason: PinTypes.indirect,
          parent: parentCid
        }
      }
    }

    return {
      cid,
      pinned: false
    }
  }

  /**
   * @param {CID} cid
   * @param {PreloadOptions & AbortOptions} options
   */
  async fetchCompleteDag (cid, options) {
    await all(this._walkDag(cid, { preload: options.preload }))
  }

  /**
   * Throws an error if the pin type is invalid
   *
   * @param {any} type
   * @returns {type is PinType}
   */
  static checkPinType (type) {
    if (typeof type !== 'string' || !Object.keys(PinTypes).includes(type)) {
      throw invalidPinTypeErr(type)
    }
    return true
  }
}

PinManager.PinTypes = PinTypes

module.exports = PinManager

/**
 * @typedef {Object} PinOptions
 * @property {any} [metadata]
 *
 * @typedef {Object} PreloadOptions
 * @property {boolean} [preload]
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */

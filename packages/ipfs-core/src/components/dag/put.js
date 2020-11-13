'use strict'

const multicodec = require('multicodec')

/**
 * @param {string} name
 * @returns {number}
 */
const nameToCodec = name => multicodec[name.toUpperCase().replace(/-/g, '_')]
const { withTimeoutOption } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('..').IPLD} config.ipld
 * @param {import("..").Pin} config.pin
 * @param {import("..").GCLock} config.gcLock
 * @param {import("..").Preload} config.preload
 */
module.exports = ({ ipld, pin, gcLock, preload }) => {
  /**
   * Store an IPLD format node
   *
   * @param {Object} dagNode
   * @param {PutOptions & AbortOptions} [options]
   * @returns {Promise<CID>}
   * @example
   * ```js
   * const obj = { simple: 'object' }
   * const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' })
   *
   * console.log(cid.toString())
   * // zBwWX9ecx5F4X54WAjmFLErnBT6ByfNxStr5ovowTL7AhaUR98RWvXPS1V3HqV1qs3r5Ec5ocv7eCdbqYQREXNUfYNuKG
   * ```
   */
  // eslint-disable-next-line complexity
  async function put (dagNode, options = {}) {
    if (options.cid && (options.format || options.hashAlg)) {
      throw new Error('Can\'t put dag node. Please provide either `cid` OR `format` and `hashAlg` options.')
    } else if (((options.format && !options.hashAlg) || (!options.format && options.hashAlg))) {
      throw new Error('Can\'t put dag node. Please provide `format` AND `hashAlg` options.')
    }

    const optionDefaults = {
      format: multicodec.DAG_CBOR,
      hashAlg: multicodec.SHA2_256
    }

    // The IPLD expects the format and hashAlg as constants
    if (options.format && typeof options.format === 'string') {
      options.format = nameToCodec(options.format)
    }
    if (options.hashAlg && typeof options.hashAlg === 'string') {
      options.hashAlg = nameToCodec(options.hashAlg)
    }

    options = options.cid ? options : Object.assign({}, optionDefaults, options)

    // js-ipld defaults to verion 1 CIDs. Hence set version 0 explicitly for
    // dag-pb nodes
    if (options.version === undefined) {
      if (options.format === multicodec.DAG_PB && options.hashAlg === multicodec.SHA2_256) {
        options.version = 0
      } else {
        options.version = 1
      }
    }

    let release

    if (options.pin) {
      release = await gcLock.readLock()
    }

    try {
      const cid = await ipld.put(dagNode, options.format, {
        hashAlg: options.hashAlg,
        cidVersion: options.version,
        signal: options.signal
      })

      if (options.pin) {
        await pin.add(cid, {
          lock: false
        })
      }

      if (options.preload !== false) {
        preload(cid)
      }

      return cid
    } finally {
      if (release) {
        release()
      }
    }
  }

  return withTimeoutOption(put)
}

/**
 * @typedef {Object} PutOptions
 * @property {CID} [cid]
 * @property {string|number} [format]
 * @property {string|number} [hashAlg]
 *
 * @property {boolean} [pin=false]
 * @property {number} [version]
 * @property {boolean} [preload=false]
 *
 * @typedef {import('..').CID} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */

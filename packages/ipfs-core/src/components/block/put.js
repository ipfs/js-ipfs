'use strict'

const Block = require('ipld-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const isIPFS = require('is-ipfs')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').BlockService} config.blockService
 * @param {import('.').Pin} config.pin
 * @param {import('.').GCLock} config.gcLock
 * @param {import('.').Preload} config.preload
 */
module.exports = ({ blockService, pin, gcLock, preload }) => {
  /**
   * Stores input as an IPFS block.
   *
   * **Note:** If you pass a `Block` instance as the block parameter, you
   * don't need to pass options, as the block instance will carry the CID
   * value as a property.
   *
   * @example
   * ```js
   * // Defaults
   * const encoder = new TextEncoder()
   * const decoder = new TextDecoder()
   *
   * const bytes = encoder.encode('a serialized object')
   * const block = await ipfs.block.put(bytes)
   *
   * console.log(decoder.decode(block.data))
   * // Logs:
   * // a serialized object
   * console.log(block.cid.toString())
   * // Logs:
   * // the CID of the object
   *
   * // With custom format and hashtype through CID
   * const CID = require('cids')
   * const another = encoder.encode('another serialized object')
   * const cid = new CID(1, 'dag-pb', multihash)
   * const block = await ipfs.block.put(another, cid)
   * console.log(decoder.decode(block.data))
   *
   * // Logs:
   * // a serialized object
   * console.log(block.cid.toString())
   * // Logs:
   * // the CID of the object
   * ```
   *
   * @param {IPLDBlock|Uint8Array} block - The block or data to store
   * @param {PutOptions & AbortOptions} [options] - **Note:** If you pass a `Block` instance as the block parameter, you don't need to pass options, as the block instance will carry the CID value as a property.
   * @returns {Promise<IPLDBlock>} - A Block type object, containing both the data and the hash of the block
   */
  async function put (block, options = {}) {
    if (Array.isArray(block)) {
      throw new Error('Array is not supported')
    }

    if (!Block.isBlock(block)) {
      /** @type {Uint8Array} */
      const bytes = (block)
      if (options.cid && isIPFS.cid(options.cid)) {
        const cid = CID.isCID(options.cid) ? options.cid : new CID(options.cid)
        block = new Block(bytes, cid)
      } else {
        const mhtype = options.mhtype || 'sha2-256'
        const format = options.format || 'dag-pb'

        /** @type {CIDVersion} */
        let cidVersion = 1

        if (options.version == null) {
          // Pick appropriate CID version
          cidVersion = mhtype === 'sha2-256' && format === 'dag-pb' ? 0 : 1
        } else {
          // @ts-ignore - options.version is a {number} but the CID constructor arg version is a {0|1}
          // TODO: https://github.com/multiformats/js-cid/pull/129
          cidVersion = options.version
        }

        const multihash = await multihashing(bytes, mhtype)
        const cid = new CID(cidVersion, format, multihash)

        block = new Block(bytes, cid)
      }
    }

    const release = await gcLock.readLock()

    try {
      await blockService.put(block, {
        signal: options.signal
      })

      if (options.preload !== false) {
        preload(block.cid)
      }

      if (options.pin === true) {
        await pin.add(block.cid, {
          recursive: true,
          signal: options.signal
        })
      }

      return block
    } finally {
      release()
    }
  }

  return withTimeoutOption(put)
}

/**
 * @typedef {Object} PutOptions
 * @property {CID} [cid] - A CID to store the block under (default: `undefined`)
 * @property {string} [format='dag-pb'] - The codec to use to create the CID (default: `'dag-pb'`)
 * @property {import('multihashes').HashName} [mhtype='sha2-256'] - The hashing algorithm to use to create the CID (default: `'sha2-256'`)
 * @property {number} [mhlen]
 * @property {CIDVersion} [version=0] - The version to use to create the CID (default: `0`)
 * @property {boolean} [pin=false] - If true, pin added blocks recursively (default: `false`)
 * @property {boolean} [preload]
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').IPLDBlock} IPLDBlock
 * @typedef {0|1} CIDVersion
 */

'use strict'

const Block = require('ipld-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const isIPFS = require('is-ipfs')
const { withTimeoutOption } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('ipfs-block-service')} config.blockService
 * @param {import('../index').Pin} config.pin
 * @param {import('../init').RWLock} config.gcLock
 * @param {import('../init').Preload} config.preload
 */
module.exports = ({ blockService, pin, gcLock, preload }) => {
  /**
   * Stores input as an IPFS block.
   *
   * @param {Uint8Array | Block} block - The block or data to store
   * @param {PutOptions} [options] - **Note:** If you pass a `Block` instance as the block parameter, you don't need to pass options, as the block instance will carry the CID value as a property.
   * @returns {Promise<Block>} - A Block type object, containing both the data and the hash of the block
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
   */
  async function put (block, options = {}) {
    if (Array.isArray(block)) {
      throw new Error('Array is not supported')
    }

    if (!Block.isBlock(block)) {
      if (options.cid && isIPFS.cid(options.cid)) {
        block = new Block(block, CID.isCID(options.cid) ? options.cid : new CID(options.cid))
      } else {
        const mhtype = options.mhtype || 'sha2-256'
        const format = options.format || 'dag-pb'

        /** @type {CIDVersion} */
        let cidVersion = 1

        if (options.version == null) {
          // Pick appropriate CID version
          cidVersion = mhtype === 'sha2-256' && format === 'dag-pb' ? 0 : 1
        } else {
          cidVersion = options.version
        }

        const multihash = await multihashing(block, mhtype)
        const cid = new CID(cidVersion, format, multihash)

        block = new Block(block, cid)
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
 * @typedef {PutSettings & AbortOptions} PutOptions
 *
 * @typedef {Object} PutSettings
 * @property {CID} [cid] - A CID to store the block under (default: `undefined`)
 * @property {string} [format] - The codec to use to create the CID (default: `'dag-pb'`)
 * @property {string} [mhtype] - The hashing algorithm to use to create the CID (default: `'sha2-256'`)
 * @property {number} [mhlen]
 * @property {CIDVersion} [version] - The version to use to create the CID (default: `0`)
 * @property {boolean} [pin] - If true, pin added blocks recursively (default: `false`)
 * @property {boolean} [preload]
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 *
 *
 *
 *
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-block')} Block
 * @typedef {0|1} CIDVersion
 */

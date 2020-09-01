'use strict'

const Block = require('ipld-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const isIPFS = require('is-ipfs')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-block')} Block
 * @typedef {0 | 1} CidVersion
 */

/**
 * @typedef {object} BlockPutOptions
 * @property {CID} [cid] - A CID to store the block under (default: `undefined`)
 * @property {string} [format] - The codec to use to create the CID (default: `'dag-pb'`)
 * @property {string} [mhtype] - The hashing algorithm to use to create the CID (default: `'sha2-256'`)
 * @property {number} [mhlen]
 * @property {CidVersion} [version] - The version to use to create the CID (default: `0`)
 * @property {boolean} [pin] - If true, pin added blocks recursively (default: `false`)
 */

/**
 * Stores input as an IPFS block.
 * @template {Record<string, any>} ExtraOptions
 * @callback BlockPut
 * @param {Buffer | Block} block - The block or data to store
 * @param {BlockPutOptions & import('../../utils').AbortOptions & ExtraOptions} [options] - **Note:** If you pass a `Block` instance as the block parameter, you don't need to pass options, as the block instance will carry the CID value as a property.
 * @returns {Promise<Block>} - A Block type object, containing both the data and the hash of the block
 */

module.exports = ({ blockService, pin, gcLock, preload }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {BlockPut<import('./get').PreloadOptions>}
   */
  async function put (block, options) {
    options = options || {}

    if (Array.isArray(block)) {
      throw new Error('Array is not supported')
    }

    if (!Block.isBlock(block)) {
      if (options.cid && isIPFS.cid(options.cid)) {
        block = new Block(block, CID.isCID(options.cid) ? options.cid : new CID(options.cid))
      } else {
        const mhtype = options.mhtype || 'sha2-256'
        const format = options.format || 'dag-pb'

        /** @type {CidVersion} */
        let cidVersion

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

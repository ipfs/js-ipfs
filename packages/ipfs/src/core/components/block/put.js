'use strict'

const Block = require('ipld-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const isIPFS = require('is-ipfs')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ blockService, pin, gcLock, preload }) => {
  /**
   * @typedef {import('cids')} CID
   * @typedef {import('ipld-block')} Block
   */

  /**
   * Stores input as an IPFS block.
   *
   * @param {Buffer | Block} block - The block or data to store
   * @param {object} [options] - **Note:** If you pass a `Block` instance as the block parameter, you don't need to pass options, as the block instance will carry the CID value as a property.
   * @param {CID} [options.cid] - A CID to store the block under (default: `undefined`)
   * @param {string} [options.format] - The codec to use to create the CID (default: `'dag-pb'`)
   * @param {string} [options.mhtype] - The hashing algorithm to use to create the CID (default: `'sha2-256'`)
   * @param {number} [options.mhlen]
   * @param {number} [options.version] - The version to use to create the CID (default: `0`)
   * @param {boolean} [options.pin] - If true, pin added blocks recursively (default: `false`)
   * @param {boolean} [options.preload] - (default: `true`)
   * @param {number} [options.timeout] - A timeout in ms (default: `undefined`)
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call (default: `undefined`)
   *
   * @returns {Promise<Block>} - A Block type object, containing both the data and the hash of the block
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

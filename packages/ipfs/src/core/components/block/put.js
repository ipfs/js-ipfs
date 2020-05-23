'use strict'

const Block = require('ipld-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const isIPFS = require('is-ipfs')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import("ipfs-interface").BlockService} BlockService
 * @typedef {import("ipfs-interface").GCLock} GCLock
 * @typedef {import("ipfs-interface").PreloadService} PreloadService
 * @typedef {import("ipfs-interface").PinService} PinService
 */

/**
 * @typedef {Object} PutConfig
 * @property {BlockService} blockService
 * @property {GCLock} gcLock
 * @property {PreloadService} preload
 * @property {PinService} pin
 *
 * @param {PutConfig} config
 * @returns {Put}
 */
module.exports = ({ blockService, pin, gcLock, preload }) => {
  /**
   * @typedef {Object} PutOptions
   * @property {CID} [cid]
   * @property {string} [format="dag-pb"]
   * @property {string} [mhtype="sha2-256"]
   * @property {number} [mhlen]
   * @property {0|1} [version=0]
   * @property {boolean} [pin=false]
   * @property {number} [timeout]
   * @property {boolean} [preload]
   * @property {AbortSignal} [signal]
   *
   * @callback Put
   * @param {Block|Buffer} block
   * @param {PutOptions} [options]
   * @returns {Promise<Block>}
   *
   * @type {Put}
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
        /** @type {0|1} */
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
      // @ts-ignore - blockService.put doesn't take second arg yet.
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

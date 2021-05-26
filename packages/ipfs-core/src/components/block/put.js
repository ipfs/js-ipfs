'use strict'

const Block = require('ipld-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const isIPFS = require('is-ipfs')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('cids').CIDVersion} CIDVersion
 */

/**
 * @param {Object} config
 * @param {import('ipfs-block-service')} config.blockService
 * @param {import('ipfs-core-types/src/pin').API} config.pin
 * @param {import('.').GCLock} config.gcLock
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ blockService, pin, gcLock, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/block').API["put"]}
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

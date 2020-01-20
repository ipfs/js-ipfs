'use strict'

const Block = require('ipfs-block')
const multihashing = require('multihashing-async')
const CID = require('cids')

module.exports = ({ blockService, gcLock, preload }) => {
  return async function put (block, options) {
    options = options || {}

    if (Array.isArray(block)) {
      throw new Error('Array is not supported')
    }

    if (!Block.isBlock(block)) {
      if (options.cid && CID.isCID(options.cid)) {
        block = new Block(block, options.cid)
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
      await blockService.put(block)

      if (options.preload !== false) {
        preload(block.cid)
      }

      return block
    } finally {
      release()
    }
  }
}

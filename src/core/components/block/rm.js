'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { PinTypes } = require('./pin/pin-manager')
const { cleanCid } = require('./utils')

module.exports = ({ blockService, gcLock, pinManager }) => {
  return async function * rm (cids, options) {
    options = options || {}

    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    // We need to take a write lock here to ensure that adding and removing
    // blocks are exclusive operations
    const release = await gcLock.writeLock()

    try {
      for (let cid of cids) {
        cid = cleanCid(cid)

        const result = {
          hash: cid.toString()
        }

        try {
          const pinResult = await pinManager.isPinnedWithType(cid, PinTypes.all)

          if (pinResult.pinned) {
            if (CID.isCID(pinResult.reason)) { // eslint-disable-line max-depth
              throw errCode(new Error(`pinned via ${pinResult.reason}`))
            }

            throw errCode(new Error(`pinned: ${pinResult.reason}`))
          }

          // remove has check when https://github.com/ipfs/js-ipfs-block-service/pull/88 is merged
          const has = await blockService._repo.blocks.has(cid)

          if (!has) {
            throw errCode(new Error('block not found'), 'ERR_BLOCK_NOT_FOUND')
          }

          await blockService.delete(cid)
        } catch (err) {
          if (!options.force) {
            result.error = `cannot remove ${cid}: ${err.message}`
          }
        }

        if (!options.quiet) {
          yield result
        }
      }
    } finally {
      release()
    }
  }
}

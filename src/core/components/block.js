'use strict'

const Block = require('ipfs-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const callbackify = require('callbackify')
const errCode = require('err-code')
const all = require('async-iterator-all')
const { PinTypes } = require('./pin/pin-manager')

module.exports = function block (self) {
  async function * rmAsyncIterator (cids, options) {
    options = options || {}

    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    // We need to take a write lock here to ensure that adding and removing
    // blocks are exclusive operations
    const release = await self._gcLock.writeLock()

    try {
      for (let cid of cids) {
        cid = cleanCid(cid)

        const result = {
          hash: cid.toString()
        }

        try {
          const pinResult = await self.pin.pinManager.isPinnedWithType(cid, PinTypes.all)

          if (pinResult.pinned) {
            if (CID.isCID(pinResult.reason)) { // eslint-disable-line max-depth
              throw errCode(new Error(`pinned via ${pinResult.reason}`))
            }

            throw errCode(new Error(`pinned: ${pinResult.reason}`))
          }

          // remove has check when https://github.com/ipfs/js-ipfs-block-service/pull/88 is merged
          const has = await self._blockService._repo.blocks.has(cid)

          if (!has) {
            throw errCode(new Error('block not found'), 'ERR_BLOCK_NOT_FOUND')
          }

          await self._blockService.delete(cid)
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

  return {
    get: callbackify.variadic(async (cid, options) => { // eslint-disable-line require-await
      options = options || {}
      cid = cleanCid(cid)

      if (options.preload !== false) {
        self._preload(cid)
      }

      return self._blockService.get(cid)
    }),
    put: callbackify.variadic(async (block, options) => {
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

      const release = await self._gcLock.readLock()

      try {
        await self._blockService.put(block)

        if (options.preload !== false) {
          self._preload(block.cid)
        }

        return block
      } finally {
        release()
      }
    }),
    rm: callbackify.variadic(async (cids, options) => { // eslint-disable-line require-await
      return all(rmAsyncIterator(cids, options))
    }),
    _rmAsyncIterator: rmAsyncIterator,
    stat: callbackify.variadic(async (cid, options) => {
      options = options || {}
      cid = cleanCid(cid)

      if (options.preload !== false) {
        self._preload(cid)
      }

      const block = await self._blockService.get(cid)

      return {
        key: cid.toString(),
        size: block.data.length
      }
    })
  }
}

function cleanCid (cid) {
  if (CID.isCID(cid)) {
    return cid
  }

  // CID constructor knows how to do the cleaning :)
  try {
    return new CID(cid)
  } catch (err) {
    throw errCode(err, 'ERR_INVALID_CID')
  }
}

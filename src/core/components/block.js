'use strict'

const Block = require('ipfs-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const waterfall = require('async/waterfall')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')
const errCode = require('err-code')

module.exports = function block (self) {
  return {
    get: promisify((cid, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      try {
        cid = cleanCid(cid)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      self._blockService.get(cid, callback)
    }),
    put: promisify((block, options, callback) => {
      callback = callback || function noop () {}

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (Array.isArray(block)) {
        return callback(new Error('Array is not supported'))
      }

      waterfall([
        (cb) => {
          if (Block.isBlock(block)) {
            return cb(null, block)
          }

          if (options.cid && CID.isCID(options.cid)) {
            return cb(null, new Block(block, options.cid))
          }

          const mhtype = options.mhtype || 'sha2-256'
          const format = options.format || 'dag-pb'
          let cidVersion
          // const mhlen = options.mhlen || 0

          if (options.version == null) {
            // Pick appropriate CID version
            cidVersion = mhtype === 'sha2-256' && format === 'dag-pb' ? 0 : 1
          } else {
            cidVersion = options.version
          }

          multihashing(block, mhtype, (err, multihash) => {
            if (err) {
              return cb(err)
            }

            let cid
            try {
              cid = new CID(cidVersion, format, multihash)
            } catch (err) {
              return cb(err)
            }

            cb(null, new Block(block, cid))
          })
        },
        (block, cb) => self._gcLock.readLock((_cb) => {
          self._blockService.put(block, (err) => {
            if (err) {
              return _cb(err)
            }

            if (options.preload !== false) {
              self._preload(block.cid)
            }

            _cb(null, block)
          })
        }, cb)
      ], callback)
    }),
    rm: promisify((cid, callback) => {
      try {
        cid = cleanCid(cid)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }

      // We need to take a write lock here to ensure that adding and removing
      // blocks are exclusive operations
      self._gcLock.writeLock((cb) => self._blockService.delete(cid, cb), callback)
    }),
    stat: promisify((cid, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      try {
        cid = cleanCid(cid)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      self._blockService.get(cid, (err, block) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          key: cid.toString(),
          size: block.data.length
        })
      })
    })
  }
}

function cleanCid (cid) {
  if (CID.isCID(cid)) {
    return cid
  }

  // CID constructor knows how to do the cleaning :)
  return new CID(cid)
}

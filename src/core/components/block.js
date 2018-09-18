'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')
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
          const cidVersion = options.version || 0
          // const mhlen = options.mhlen || 0

          multihashing(block, mhtype, (err, multihash) => {
            if (err) {
              return cb(err)
            }

            cb(null, new Block(block, new CID(cidVersion, format, multihash)))
          })
        },
        (block, cb) => self._blockService.put(block, (err) => {
          if (err) {
            return cb(err)
          }

          if (options.preload !== false) {
            self._preload(block.cid)
          }

          cb(null, block)
        })
      ], callback)
    }),
    rm: promisify((cid, callback) => {
      try {
        cid = cleanCid(cid)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }
      self._blockService.delete(cid, callback)
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
          key: multihash.toB58String(cid.multihash),
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

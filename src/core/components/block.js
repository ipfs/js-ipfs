'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')
const waterfall = require('async/waterfall')

module.exports = function block (self) {
  return {
    get: (cid, callback) => {
      cid = cleanCid(cid)
      self._blockService.get(cid, callback)
    },
    put: (block, cid, callback) => {
      if (typeof cid === 'function') {
        // legacy (without CID)
        callback = cid
        cid = undefined
      }

      if (Array.isArray(block)) {
        return callback(new Error('Array is not supported'))
      }

      if (Buffer.isBuffer(block)) {
        block = new Block(block)
      }

      waterfall([
        (cb) => {
          if (cid) {
            return cb(null, cid)
          }

          block.key('sha2-256', (err, key) => {
            if (err) {
              return cb(err)
            }

            cb(null, new CID(key))
          })
        },
        (cid, cb) => self._blockService.put({block: block, cid: cid}, cb)
      ], (err) => {
        if (err) {
          return callback(err)
        }

        callback(null, block)
      })
    },
    rm: (cid, callback) => {
      cid = cleanCid(cid)
      self._blockService.delete(cid, callback)
    },
    stat: (cid, callback) => {
      cid = cleanCid(cid)

      self._blockService.get(cid, (err, block) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          key: multihash.toB58String(cid.multihash),
          size: block.data.length
        })
      })
    }
  }
}

function cleanCid (cid) {
  if (CID.isCID(cid)) {
    return cid
  }

  // CID constructor knows how to do the cleaning :)
  return new CID(cid)
}

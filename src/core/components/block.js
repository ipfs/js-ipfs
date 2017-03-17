'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')
const multihashing = require('multihashing-async')
const CID = require('cids')
const waterfall = require('async/waterfall')

module.exports = function block (self) {
  return {
    get: (cid, callback) => {
      cid = cleanCid(cid)
      self._blockService.get(cid, callback)
    },
    put: (block, callback) => {
      if (Array.isArray(block)) {
        return callback(new Error('Array is not supported'))
      }

      waterfall([
        (cb) => {
          if (Block.isBlock(block)) {
            return cb(null, block)
          }

          multihashing(block, 'sha2-256', (err, multihash) => {
            if (err) {
              return cb(err)
            }

            cb(null, new Block(block, new CID(multihash)))
          })
        },
        (block, cb) => self._blockService.put(block, (err) => {
          if (err) {
            return cb(err)
          }
          cb(null, block)
        })
      ], callback)
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

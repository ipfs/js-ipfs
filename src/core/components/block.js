'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')

module.exports = function block (self) {
  return {
    get: (cid, callback) => {
      cid = cleanCid(cid)
      self._blockService.get(cid, callback)
    },
    put: (block, cid, callback) => {
      if (Array.isArray(block)) {
        return callback(new Error('Array is not supported'))
      }

      if (Buffer.isBuffer(block)) {
        block = new Block(block)
      }

      self._blockService.put({
        block: block,
        cid: cid
      }, (err) => {
        callback(err, block)
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
  if (typeof cid === 'string') {
    return new CID(cid)
  }
  return cid
}

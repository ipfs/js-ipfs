'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')

module.exports = function block (self) {
  return {
    get: (hash, callback) => {
      hash = cleanHash(hash)

      self._blockS.getBlock(hash, callback)
    },
    put: (block, callback) => {
      if (Array.isArray(block)) {
        return callback(new Error('Array is not supported'))
      }
      if (Buffer.isBuffer(block)) {
        block = new Block(block)
      }

      self._blockS.addBlock(block, (err) => {
        callback(err, block)
      })
    },
    del: (hash, callback) => {
      hash = cleanHash(hash)
      self._blockS.deleteBlock(hash, callback)
    },
    stat: (hash, callback) => {
      hash = cleanHash(hash)

      self._blockS.getBlock(hash, (err, block) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          key: hash,
          size: block.data.length
        })
      })
    }
  }
}

function cleanHash (hash) {
  if (typeof hash === 'string') {
    return multihash.fromB58String(hash)
  }
  return hash
}

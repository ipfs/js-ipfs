'use strict'

module.exports = function block (self) {
  return {
    get: (multihash, callback) => {
      self._blockS.getBlock(multihash, callback)
    },
    put: (block, callback) => {
      self._blockS.addBlock(block, callback)
    },
    del: (multihash, callback) => {
      self._blockS.deleteBlock(multihash, callback)
    },
    stat: (multihash, callback) => {
      self._blockS.getBlock(multihash, (err, block) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          Key: multihash,
          Size: block.data.length
        })
      })
    }
  }
}

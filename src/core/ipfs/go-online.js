'use strict'

const async = require('async')
const Bitswap = require('ipfs-bitswap')

module.exports = function goOnline (self) {
  return (cb) => {
    async.series([
      self.load,
      self.libp2p.start
    ], (err) => {
      if (err) {
        return cb(err)
      }

      self._bitswap = new Bitswap(
        self._peerInfo,
        self._libp2pNode,
        self._repo.datastore,
        self._peerInfoBook
      )
      self._bitswap.start()
      self._blockS.goOnline(self._bitswap)
      cb()
    })
  }
}

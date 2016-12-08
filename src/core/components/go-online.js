'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const FloodSub = require('libp2p-floodsub')

module.exports = function goOnline (self) {
  return (cb) => {
    series([
      self.load,
      self.libp2p.start
    ], (err) => {
      if (err) {
        return cb(err)
      }

      self._bitswap = new Bitswap(
        self._libp2pNode.peerInfo,
        self._libp2pNode,
        self._repo.blockstore,
        self._libp2pNode.peerBook
      )
      self._bitswap.start()
      self._blockService.goOnline(self._bitswap)

      //
      self._pubsub = new FloodSub(self._libp2pNode)
      //

      cb()
    })
  }
}

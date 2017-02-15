'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const FloodSub = require('libp2p-floodsub')

module.exports = (self) => {
  return (callback) => {
    series([
      (cb) => self.load(cb),
      (cb) => self.libp2p.start(cb)
    ], (err) => {
      if (err) {
        return callback(err)
      }

      self._bitswap = new Bitswap(
        self._libp2pNode,
        self._repo.blockstore,
        self._libp2pNode.peerBook
      )

      self._pubsub = new FloodSub(self._libp2pNode)

      series([
        (cb) => {
          self._bitswap.start()
          cb()
        },
        (cb) => {
          self._blockService.goOnline(self._bitswap)
          cb()
        },
        (cb) => {
          if (self._configOpts.EXPERIMENTAL.pubsub) {
            self._pubsub.start(cb)
          } else {
            cb()
          }
        }
      ], callback)
    })
  }
}

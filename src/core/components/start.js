'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const FloodSub = require('libp2p-floodsub')

module.exports = (self) => {
  return (callback) => {
    callback = callback || function noop () {}

    series([
      (cb) => self.preStart(cb),
      (cb) => self.libp2p.start(cb)
    ], (err) => {
      if (err) {
        return callback(err)
      }

      self._bitswap = new Bitswap(
        self._libp2pNode,
        self._repo.blockstore,
        self._peerInfoBook
      )

      const pubsub = self._options.EXPERIMENTAL.pubsub

      if (pubsub) {
        self._pubsub = new FloodSub(self._libp2pNode)
      }

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
          if (pubsub) {
            self._pubsub.start(cb)
          } else {
            cb()
          }
        },
        (cb) => {
          self.emit('start')
          cb()
        }
      ], callback)
    })
  }
}

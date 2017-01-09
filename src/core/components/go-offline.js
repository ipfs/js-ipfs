'use strict'

module.exports = (self) => {
  return (callback) => {
    self._blockService.goOffline()
    self._bitswap.stop()
    self._pubsub.stop((err) => {
      if (err) {
        return callback(err)
      }
      self.libp2p.stop(callback)
    })
  }
}

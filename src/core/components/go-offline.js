'use strict'

module.exports = (self) => {
  return (callback) => {
    self._blockService.goOffline()
    self._bitswap.stop()

    if (self._configOpts.EXPERIMENTAL.pubsub) {
      self._pubsub.stop(next)
    } else {
      next()
    }

    function next (err) {
      if (err) {
        return callback(err)
      }
      self.libp2p.stop(callback)
    }
  }
}

'use strict'

module.exports = (self) => {
  return (callback) => {
    callback = callback || function noop () {}

    self._blockService.goOffline()
    self._bitswap.stop()

    if (self._options.EXPERIMENTAL.pubsub) {
      self._pubsub.stop(next)
    } else {
      next()
    }

    function next (err) {
      if (err) {
        return callback(err)
      }
      self.libp2p.stop((err) => {
        if (err) {
          return callback(err)
        }
        self.emit('stop')
        callback()
      })
    }
  }
}

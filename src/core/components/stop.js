'use strict'

const series = require('async/series')

module.exports = (self) => {
  return (callback) => {
    callback = callback || function noop () {}
    self.log('stop')

    const done = (err) => {
      if (err) {
        self.emit('error', err)
        return callback(err)
      }
      self.state.stopped()
      self.emit('stop')
      callback()
    }

    if (self.state.state() !== 'running') {
      return done(new Error('Not able to stop from state: ' + self.state.state()))
    }

    self.state.stop()
    self._blockService.goOffline()
    self._bitswap.stop()

    series([
      (cb) => {
        if (self._options.EXPERIMENTAL.pubsub) {
          self._pubsub.stop(cb)
        } else {
          cb()
        }
      },
      (cb) => self.libp2p.stop(cb),
      (cb) => self._repo.close(cb)
    ], done)
  }
}

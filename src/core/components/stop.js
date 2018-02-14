'use strict'

const series = require('async/series')
const promisify = require('promisify-es6')

module.exports = (self) => {
  return promisify((callback) => {
    callback = callback || function noop () {}

    self.log('stop')

    if (self.state.state() === 'stopped') {
      return callback(new Error('Already stopped'))
    }

    if (self.state.state() !== 'running') {
      return callback(new Error('Not able to stop from state: ' + self.state.state()))
    }

    const done = (err) => {
      if (err) {
        self.emit('error', err)
        return callback(err)
      }
      self.state.stopped()
      self.emit('stop')
      callback()
    }

    self.state.stop()
    self._blockService.unsetExchange()
    self._bitswap.stop()

    series([
      (cb) => self.libp2p.stop(cb),
      (cb) => self._repo.close(cb)
    ], done)
  })
}

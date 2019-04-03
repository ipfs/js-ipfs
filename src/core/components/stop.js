'use strict'

const parallel = require('async/parallel')
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

    self.state.stop()
    self._blockService.unsetExchange()
    self._bitswap.stop()
    self._preload.stop()

    parallel([
      cb => self._ipns.republisher.stop(cb),
      cb => self._mfsPreload.stop(cb),
      cb => {
        const libp2p = self.libp2p
        self.libp2p = null
        libp2p.stop(cb)
      }
    ], err => {
      self._repo.close(closeErr => {
        if (err || closeErr) {
          self.emit('error', err || closeErr)
          return callback(err || closeErr)
        }

        self.state.stopped()
        self.emit('stop')
        callback()
      })
    })
  })
}

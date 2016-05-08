'use strict'

const debug = require('debug')
const log = debug('core:offline')

module.exports = function goOffline (self) {
  return (cb) => {
    self._blockS.goOffline()
    self._bitswap.stop()
    self.libp2p.stop((err) => {
      if (err) {
        log('Error trying to go offline', err)
      }
      cb()
    })
  }
}

'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')

module.exports = (self) => {
  return promisify((callback) => {
    series([
      (cb) => {
        switch (self.state.state()) {
          case 'initialized': return self.preStart(cb)
          case 'stopped': return cb()
          default: cb(new Error(`Not able to start from state: ${self.state.state()}`))
        }
      },
      (cb) => {
        self.log('starting')
        self.state.start()
        cb()
      },
      (cb) => self.libp2p.start(cb),
      (cb) => {
        self._bitswap = new Bitswap(
          self._libp2pNode,
          self._repo.blocks,
          { statsEnabled: true }
        )

        self._bitswap.start()
        self._blockService.setExchange(self._bitswap)
      }
    ], (err) => {
      if (err) {
        setImmediate(() => self.emit('error', err))
        return callback(err)
      }

      self.log('started')
      self.state.started()
      setImmediate(() => self.emit('start'))
      callback()
    })
  })
}

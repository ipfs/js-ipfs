'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')

const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const createLibp2pBundle = require('./libp2p')

module.exports = (self) => {
  return promisify((callback) => {
    const done = (err) => {
      if (err) {
        setImmediate(() => self.emit('error', err))
        return callback(err)
      }

      self.state.started()
      setImmediate(() => self.emit('start'))
      callback()
    }

    if (self.state.state() !== 'stopped') {
      return done(new Error(`Not able to start from state: ${self.state.state()}`))
    }

    self.log('starting')
    self.state.start()

    series([
      (cb) => {
        // The repo may be closed if previously stopped
        self._repo.closed
          ? self._repo.open(cb)
          : cb()
      },
      (cb) => {
        self._repo.config.get((err, config) => {
          if (err) return cb(err)

          const libp2p = createLibp2pBundle(self, config)

          libp2p.start(err => {
            if (err) return cb(err)
            self.libp2p = libp2p
            cb()
          })
        })
      },
      (cb) => {
        const ipnsRouting = routingConfig(self)
        self._ipns = new IPNS(ipnsRouting, self._repo.datastore, self._peerInfo, self._keychain, self._options)

        self._bitswap = new Bitswap(
          self.libp2p,
          self._repo.blocks,
          { statsEnabled: true }
        )

        self._bitswap.start()
        self._blockService.setExchange(self._bitswap)

        self._preload.start()
        self._ipns.republisher.start()
        self._mfsPreload.start(cb)
      }
    ], done)
  })
}

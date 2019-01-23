'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const get = require('lodash/get')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')
const { TieredDatastore } = require('datastore-core')

const IPNS = require('../ipns')
const PubsubDatastore = require('../ipns/routing/pubsub-datastore')
const OfflineDatastore = require('../ipns/routing/offline-datastore')
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
        // Setup online routing for IPNS with a tiered routing composed by a DHT and a Pubsub router (if properly enabled)
        const ipnsStores = []

        // Add IPNS pubsub if enabled
        let pubsubDs
        if (get(self._options, 'EXPERIMENTAL.ipnsPubsub', false)) {
          const pubsub = self.libp2p.pubsub
          const localDatastore = self._repo.datastore
          const peerId = self._peerInfo.id

          pubsubDs = new PubsubDatastore(pubsub, localDatastore, peerId)
          ipnsStores.push(pubsubDs)
        }

        // DHT should be added as routing if we are not running with local flag
        // TODO: Need to change this logic once DHT is enabled by default, for now fallback to Offline datastore
        if (get(self._options, 'EXPERIMENTAL.dht', false) && !self._options.local) {
          ipnsStores.push(self.libp2p.dht)
        } else {
          const offlineDatastore = new OfflineDatastore(self._repo)
          ipnsStores.push(offlineDatastore)
        }

        // Create ipns routing with a set of datastores
        const routing = new TieredDatastore(ipnsStores)
        self._ipns = new IPNS(routing, self._repo.datastore, self._peerInfo, self._keychain, self._options)

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

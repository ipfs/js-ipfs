'use strict'

const get = require('lodash/get')
const defaultsDeep = require('@nodeutils/defaults-deep')
const ipnsUtils = require('../ipns/routing/utils')

module.exports = function libp2p (self, config) {
  const options = self._options || {}
  config = config || {}

  // Always create libp2p via a bundle function
  const createBundle = typeof options.libp2p === 'function'
    ? options.libp2p
    : defaultBundle

  const { datastore } = self._repo
  const peerInfo = self._peerInfo
  const peerBook = self._peerInfoBook
  const libp2p = createBundle({ options, config, datastore, peerInfo, peerBook })
  let discoveredPeers = []

  const putAndDial = peerInfo => {
    peerBook.put(peerInfo)
    libp2p.dial(peerInfo, () => {})
  }

  libp2p.on('start', () => {
    peerInfo.multiaddrs.forEach((ma) => {
      self._print('Swarm listening on', ma.toString())
    })
    discoveredPeers.forEach(putAndDial)
    discoveredPeers = []
  })

  libp2p.on('peer:discovery', (peerInfo) => {
    if (self.isOnline()) {
      putAndDial(peerInfo)
    } else {
      discoveredPeers.push(peerInfo)
    }
  })

  libp2p.on('peer:connect', peerInfo => peerBook.put(peerInfo))

  return libp2p
}

function defaultBundle ({ datastore, peerInfo, peerBook, options, config }) {
  const libp2pDefaults = {
    datastore,
    peerInfo,
    peerBook,
    config: {
      peerDiscovery: {
        mdns: {
          enabled: get(options, 'config.Discovery.MDNS.Enabled',
            get(config, 'Discovery.MDNS.Enabled', true))
        },
        webRTCStar: {
          enabled: get(options, 'config.Discovery.webRTCStar.Enabled',
            get(config, 'Discovery.webRTCStar.Enabled', true))
        },
        bootstrap: {
          list: get(options, 'config.Bootstrap',
            get(config, 'Bootstrap', []))
        }
      },
      relay: {
        enabled: get(options, 'relay.enabled',
          get(config, 'relay.enabled', false)),
        hop: {
          enabled: get(options, 'relay.hop.enabled',
            get(config, 'relay.hop.enabled', false)),
          active: get(options, 'relay.hop.active',
            get(config, 'relay.hop.active', false))
        }
      },
      dht: {
        kBucketSize: get(options, 'dht.kBucketSize', 20),
        enabled: get(options, 'offline', false) ? false : undefined, // disable if offline
        randomWalk: {
          enabled: get(options, 'dht.randomWalk.enabled', true)
        },
        validators: {
          ipns: ipnsUtils.validator
        },
        selectors: {
          ipns: ipnsUtils.selector
        }
      },
      EXPERIMENTAL: {
        pubsub: get(options, 'EXPERIMENTAL.pubsub', false)
      }
    },
    connectionManager: get(options, 'connectionManager',
      get(config, 'connectionManager', {}))
  }

  const libp2pOptions = defaultsDeep(get(options, 'libp2p', {}), libp2pDefaults)

  // Required inline to reduce startup time
  // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
  const Node = require('../runtime/libp2p-nodejs')
  return new Node(libp2pOptions)
}

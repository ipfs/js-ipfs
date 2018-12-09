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
    datastore: opts.datastore,
    peerInfo: opts.peerInfo,
    peerBook: opts.peerBook,
    config: {
      peerDiscovery: {
        mdns: {
          enabled: get(opts.options, 'config.Discovery.MDNS.Enabled',
            get(opts.config, 'Discovery.MDNS.Enabled', true))
        },
        webRTCStar: {
          enabled: get(opts.options, 'config.Discovery.webRTCStar.Enabled',
            get(opts.config, 'Discovery.webRTCStar.Enabled', true))
        },
        bootstrap: {
          list: get(opts.options, 'config.Bootstrap',
            get(opts.config, 'Bootstrap', []))
        }
      },
      relay: {
        enabled: get(opts.options, 'relay.enabled',
          get(opts.config, 'relay.enabled', false)),
        hop: {
          enabled: get(opts.options, 'relay.hop.enabled',
            get(opts.config, 'relay.hop.enabled', false)),
          active: get(opts.options, 'relay.hop.active',
            get(opts.config, 'relay.hop.active', false))
        }
      },
      dht: {
        kBucketSize: get(opts.options, 'dht.kBucketSize', 20),
        enabledDiscovery: get(opts.options, 'dht.enabledDiscovery', true),
        validators: {
          ipns: ipnsUtils.validator
        },
        selectors: {
          ipns: ipnsUtils.selector
        }
      },
      EXPERIMENTAL: {
        dht: true,
        pubsub: get(opts.options, 'EXPERIMENTAL.pubsub', false)
      }
    },
    connectionManager: get(opts.options, 'connectionManager',
      get(opts.config, 'connectionManager', {}))
  }

  const libp2pOptions = defaultsDeep(get(options, 'libp2p', {}), libp2pDefaults)

  // Required inline to reduce startup time
  // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
  const Node = require('../runtime/libp2p-nodejs')
  return new Node(libp2pOptions)
}

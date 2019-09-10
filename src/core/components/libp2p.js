'use strict'

const get = require('dlv')
const mergeOptions = require('merge-options')
const errCode = require('err-code')
const ipnsUtils = require('../ipns/routing/utils')
const multiaddr = require('multiaddr')
const DelegatedPeerRouter = require('libp2p-delegated-peer-routing')
const DelegatedContentRouter = require('libp2p-delegated-content-routing')
const PubsubRouters = require('../runtime/libp2p-pubsub-routers-nodejs')

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

  libp2p.on('stop', () => {
    // Clear our addresses so we can start clean
    peerInfo.multiaddrs.clear()
  })

  libp2p.on('start', () => {
    peerInfo.multiaddrs.forEach((ma) => {
      self._print('Swarm listening on', ma.toString())
    })
  })

  libp2p.on('peer:connect', peerInfo => peerBook.put(peerInfo))

  return libp2p
}

function defaultBundle ({ datastore, peerInfo, peerBook, options, config }) {
  // Set up Delegate Routing based on the presence of Delegates in the config
  let contentRouting
  let peerRouting
  const delegateHosts = get(options, 'config.Addresses.Delegates',
    get(config, 'Addresses.Delegates', [])
  )
  if (delegateHosts.length > 0) {
    // Pick a random delegate host
    const delegateString = delegateHosts[Math.floor(Math.random() * delegateHosts.length)]
    const delegateAddr = multiaddr(delegateString).toOptions()
    const delegatedApiOptions = {
      host: delegateAddr.host,
      // port is a string atm, so we need to convert for the check
      protocol: parseInt(delegateAddr.port) === 443 ? 'https' : 'http',
      port: delegateAddr.port
    }
    contentRouting = [new DelegatedContentRouter(peerInfo.id, delegatedApiOptions)]
    peerRouting = [new DelegatedPeerRouter(delegatedApiOptions)]
  }

  const getPubsubRouter = () => {
    let router = get(config, 'Pubsub.Router', 'gossipsub')

    if (!router) {
      router = 'gossipsub'
    }

    if (!PubsubRouters[router]) {
      throw errCode(new Error(`Router unavailable. Configure libp2p.modules.pubsub to use the ${router} router.`), 'ERR_NOT_SUPPORTED')
    }

    return PubsubRouters[router]
  }

  const libp2pDefaults = {
    datastore,
    peerInfo,
    peerBook,
    modules: {
      contentRouting,
      peerRouting,
      pubsub: getPubsubRouter()
    },
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
          get(config, 'relay.enabled', true)),
        hop: {
          enabled: get(options, 'relay.hop.enabled',
            get(config, 'relay.hop.enabled', false)),
          active: get(options, 'relay.hop.active',
            get(config, 'relay.hop.active', false))
        }
      },
      dht: {
        kBucketSize: get(options, 'dht.kBucketSize', 20),
        // enabled: !get(options, 'offline', false), // disable if offline, on by default
        enabled: false,
        randomWalk: {
          enabled: false // disabled waiting for https://github.com/libp2p/js-libp2p-kad-dht/issues/86
        },
        validators: {
          ipns: ipnsUtils.validator
        },
        selectors: {
          ipns: ipnsUtils.selector
        }
      },
      pubsub: {
        enabled: get(config, 'Pubsub.Enabled', true)
      }
    },
    connectionManager: get(options, 'connectionManager',
      {
        maxPeers: get(config, 'Swarm.ConnMgr.HighWater'),
        minPeers: get(config, 'Swarm.ConnMgr.LowWater')
      })
  }

  const libp2pOptions = mergeOptions(libp2pDefaults, get(options, 'libp2p', {}))
  // Required inline to reduce startup time
  // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
  const Node = require('../runtime/libp2p-nodejs')
  return new Node(libp2pOptions)
}

'use strict'

const get = require('dlv')
const mergeOptions = require('merge-options')
const errCode = require('err-code')
const PubsubRouters = require('../runtime/libp2p-pubsub-routers-nodejs')

module.exports = ({
  options,
  peerId,
  multiaddrs = [],
  repo,
  config
}) => {
  options = options || {}
  config = config || {}

  const { datastore } = repo
  const libp2pOptions = getLibp2pOptions({ options, config, datastore, peerId, multiaddrs })

  if (typeof options.libp2p === 'function') {
    return options.libp2p({ libp2pOptions, options, config, datastore, peerId })
  }

  // Required inline to reduce startup time
  const Libp2p = require('libp2p')
  return new Libp2p(mergeOptions(libp2pOptions, get(options, 'libp2p', {})))
}

function getLibp2pOptions ({ options, config, datastore, peerId, multiaddrs }) {
  const getPubsubRouter = () => {
    const router = get(config, 'Pubsub.Router') || 'gossipsub'

    if (!PubsubRouters[router]) {
      throw errCode(new Error(`Router unavailable. Configure libp2p.modules.pubsub to use the ${router} router.`), 'ERR_NOT_SUPPORTED')
    }

    return PubsubRouters[router]
  }

  const libp2pDefaults = {
    datastore,
    peerId: peerId,
    modules: {}
  }

  const bootstrapList = get(options, 'config.Bootstrap', get(config, 'Bootstrap', []))
  const libp2pOptions = {
    modules: {
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
          list: bootstrapList
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
        kBucketSize: get(options, 'dht.kBucketSize', 20)
      },
      pubsub: {
        enabled: get(options, 'config.Pubsub.Enabled',
          get(config, 'Pubsub.Enabled', true))
      }
    },
    addresses: {
      listen: multiaddrs
    },
    connectionManager: get(options, 'connectionManager', {
      maxConnections: get(options, 'config.Swarm.ConnMgr.HighWater',
        get(config, 'Swarm.ConnMgr.HighWater')),
      minConnections: get(options, 'config.Swarm.ConnMgr.LowWater',
        get(config, 'Swarm.ConnMgr.LowWater'))
    })
  }

  // Required inline to reduce startup time
  // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
  const getEnvLibp2pOptions = require('../runtime/libp2p-nodejs')

  // Merge defaults with Node.js/browser/other environments options and configuration
  const libp2pConfig = mergeOptions(
    libp2pDefaults,
    getEnvLibp2pOptions(),
    libp2pOptions
  )

  if (bootstrapList.length > 0) {
    libp2pConfig.modules.peerDiscovery.push(require('libp2p-bootstrap'))
  }

  return libp2pConfig
}

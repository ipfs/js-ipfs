'use strict'

const get = require('dlv')
const mergeOptions = require('merge-options')
const errCode = require('err-code')
const PubsubRouters = require('../runtime/libp2p-pubsub-routers-nodejs')

/**
 * @param {Object} config
 * @param {Repo} config.repo
 * @param {IPFSOptions|undefined} config.options
 * @param {PeerId} config.peerId
 * @param {Multiaddr[]|undefined} config.multiaddrs
 * @param {KeychainConfig|undefined} config.keychainConfig
 * @param {Partial<IPFSConfig>|undefined} config.config
 * @returns {LibP2P}
 */
module.exports = ({
  options = {},
  peerId,
  multiaddrs = [],
  repo,
  keychainConfig = {},
  config = {}
}) => {
  const { datastore, keys } = repo

  const libp2pOptions = getLibp2pOptions({
    options,
    config,
    datastore,
    keys,
    keychainConfig,
    peerId,
    multiaddrs
  })

  if (typeof options.libp2p === 'function') {
    return options.libp2p({ libp2pOptions, options, config, datastore, peerId })
  }

  // Required inline to reduce startup time
  const Libp2p = require('libp2p')

  return new Libp2p(libp2pOptions)
}

/**
 * @param {Object} input
 * @param {IPFSOptions} input.options
 * @param {Partial<IPFSConfig>} input.config
 * @param {Repo['datastore']} input.datastore
 * @param {Repo['keys']} input.keys
 * @param {KeychainConfig} input.keychainConfig
 * @param {PeerId} input.peerId
 * @param {Multiaddr[]} input.multiaddrs
 */
function getLibp2pOptions ({ options, config, datastore, keys, keychainConfig, peerId, multiaddrs }) {
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
          list: get(options, 'config.Bootstrap', get(config, 'Bootstrap', []))
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
        enabled: get(config, 'Routing.Type', 'none') !== 'none',
        clientMode: get(config, 'Routing.Type', 'dht') !== 'dhtserver',
        kBucketSize: get(options, 'dht.kBucketSize', 20)
      },
      pubsub: {
        enabled: get(options, 'config.Pubsub.Enabled',
          get(config, 'Pubsub.Enabled', true))
      },
      nat: {
        enabled: get(options, 'nat.enabled', !get(config, 'Swarm.DisableNatPortMap', false)),
        ttl: get(options, 'nat.ttl', 7200),
        autoUpdate: get(options, 'nat.autoUpdate', true),
        gateway: get(options, 'nat.gateway'),
        externalIp: get(options, 'nat.externalIp'),
        pmp: {
          enabled: get(options, 'nat.pmp.enabled', false)
        }
      }
    },
    addresses: {
      listen: multiaddrs,
      announce: get(options, 'addresses.announce',
        get(config, 'Addresses.Announce', []))
    },
    connectionManager: get(options, 'connectionManager', {
      maxConnections: get(options, 'config.Swarm.ConnMgr.HighWater',
        get(config, 'Swarm.ConnMgr.HighWater')),
      minConnections: get(options, 'config.Swarm.ConnMgr.LowWater',
        get(config, 'Swarm.ConnMgr.LowWater'))
    }),
    keychain: {
      datastore: keys,
      ...keychainConfig
    }
  }

  // Required inline to reduce startup time
  // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
  const getEnvLibp2pOptions = require('../runtime/libp2p-nodejs')

  let constructorOptions = get(options, 'libp2p', {})

  if (typeof constructorOptions === 'function') {
    constructorOptions = {}
  }

  // Merge defaults with Node.js/browser/other environments options and configuration
  const libp2pConfig = mergeOptions(
    libp2pDefaults,
    getEnvLibp2pOptions(),
    libp2pOptions,
    constructorOptions
  )

  const bootstrapList = get(libp2pConfig, 'config.peerDiscovery.bootstrap.list', [])

  if (bootstrapList.length > 0) {
    libp2pConfig.modules.peerDiscovery.push(require('libp2p-bootstrap'))
  }

  return libp2pConfig
}

/**
 * @typedef {Object} KeychainConfig
 * @property {string} [pass]
 *
 * @typedef {import('.').Repo} Repo
 * @typedef {import('.').Multiaddr} Multiaddr
 * @typedef {import('.').PeerId} PeerId
 * @typedef {import('.').Options} IPFSOptions
 * @typedef {import('libp2p')} LibP2P
 * @typedef {import('libp2p').Libp2pOptions & import('libp2p').constructorOptions} Options
 * @typedef {import('.').IPFSConfig} IPFSConfig
 */

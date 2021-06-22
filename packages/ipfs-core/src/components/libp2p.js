'use strict'

const get = require('dlv')
const mergeOptions = require('merge-options')
const errCode = require('err-code')
const PubsubRouters = require('../runtime/libp2p-pubsub-routers-nodejs')
const pkgversion = require('../../package.json').version

/**
 * @typedef {Object} KeychainConfig
 * @property {string} [pass]
 *
 * @typedef {import('ipfs-repo')} Repo
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('../types').Options} IPFSOptions
 * @typedef {import('libp2p')} LibP2P
 * @typedef {import('libp2p').Libp2pOptions & import('libp2p').CreateOptions} Libp2pOptions
 * @typedef {import('ipfs-core-types/src/config').Config} IPFSConfig
 * @typedef {import('multiaddr').Multiaddr} Multiaddr
 */

/**
 * @param {Object} config
 * @param {Repo} config.repo
 * @param {IPFSOptions|undefined} config.options
 * @param {PeerId} config.peerId
 * @param {Multiaddr[]|undefined} config.multiaddrs
 * @param {KeychainConfig|undefined} config.keychainConfig
 * @param {Partial<IPFSConfig>|undefined} config.config
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

  return Libp2p.create(libp2pOptions)
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
 * @returns {Libp2pOptions}
 */
function getLibp2pOptions ({ options, config, datastore, keys, keychainConfig, peerId, multiaddrs }) {
  const getPubsubRouter = () => {
    const router = get(config, 'Pubsub.Router') || 'gossipsub'

    // @ts-ignore - `router` value is not constrained
    if (!PubsubRouters[router]) {
      throw errCode(new Error(`Router unavailable. Configure libp2p.modules.pubsub to use the ${router} router.`), 'ERR_NOT_SUPPORTED')
    }

    // @ts-ignore - `router` value is not constrained
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
          enabled: get(options, 'config.Discovery.MDNS.Enabled', get(config, 'Discovery.MDNS.Enabled', true))
        },
        webRTCStar: {
          enabled: get(options, 'config.Discovery.webRTCStar.Enabled', get(config, 'Discovery.webRTCStar.Enabled', true))
        },
        bootstrap: {
          list: get(options, 'config.Bootstrap', get(config, 'Bootstrap', []))
        }
      },
      relay: {
        enabled: get(options, 'relay.enabled', get(config, 'relay.enabled', true)),
        hop: {
          enabled: get(options, 'relay.hop.enabled', get(config, 'relay.hop.enabled', false)),
          active: get(options, 'relay.hop.active', get(config, 'relay.hop.active', false))
        }
      },
      dht: {
        enabled: get(config, 'Routing.Type', 'none') !== 'none',
        clientMode: get(config, 'Routing.Type', 'dht') !== 'dhtserver',
        kBucketSize: get(options, 'dht.kBucketSize', 20)
      },
      pubsub: {
        enabled: get(options, 'config.Pubsub.Enabled', get(config, 'Pubsub.Enabled', true))
      },
      nat: {
        enabled: !get(config, 'Swarm.DisableNatPortMap', false)
      }
    },
    addresses: {
      listen: multiaddrs.map(ma => ma.toString()),
      announce: get(options, 'addresses.announce', get(config, 'Addresses.Announce', [])),
      noAnnounce: get(options, 'addresses.noAnnounce', get(config, 'Addresses.NoAnnounce', []))
    },
    connectionManager: get(options, 'connectionManager', {
      maxConnections: get(options, 'config.Swarm.ConnMgr.HighWater', get(config, 'Swarm.ConnMgr.HighWater')),
      minConnections: get(options, 'config.Swarm.ConnMgr.LowWater', get(config, 'Swarm.ConnMgr.LowWater'))
    }),
    keychain: {
      datastore: keys,
      ...keychainConfig
    },
    host: {
      agentVersion: `js-ipfs/${pkgversion}`
    }
  }

  // Required inline to reduce startup time
  // Note: libp2p-nodejs gets replaced by libp2p-browser when webpacked/browserified
  const getEnvLibp2pOptions = require('../runtime/libp2p-nodejs')

  /** @type {import('libp2p').Libp2pOptions | undefined} */
  let constructorOptions = get(options, 'libp2p', undefined)

  if (typeof constructorOptions === 'function') {
    constructorOptions = undefined
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

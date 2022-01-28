import get from 'dlv'
import mergeOpts from 'merge-options'
import errCode from 'err-code'
import { routers } from 'ipfs-core-config/libp2p-pubsub-routers'
// @ts-expect-error - no types
import DelegatedPeerRouter from 'libp2p-delegated-peer-routing'
// @ts-expect-error - no types
import DelegatedContentRouter from 'libp2p-delegated-content-routing'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { Multiaddr } from 'multiaddr'
import { ipfsCore as pkgversion } from '../version.js'
import { libp2pConfig as getEnvLibp2pOptions } from 'ipfs-core-config/libp2p'
import bootstrap from 'libp2p-bootstrap'
import Libp2p from 'libp2p'
import * as ipns from 'ipns'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

/**
 * @typedef {object} DekOptions
 * @property {string} hash
 * @property {string} salt
 * @property {number} iterationCount
 * @property {number} keyLength
 *
 * @typedef {Object} KeychainConfig
 * @property {string} [pass]
 * @property {DekOptions} [dek]
 *
 * @typedef {import('ipfs-repo').IPFSRepo} Repo
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('../types').Options} IPFSOptions
 * @typedef {import('libp2p')} LibP2P
 * @typedef {import('libp2p').Libp2pOptions & import('libp2p').CreateOptions} Libp2pOptions
 * @typedef {import('libp2p').Libp2pConfig} Libp2pConfig
 * @typedef {import('ipfs-core-types/src/config').Config} IPFSConfig
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
export function createLibp2p ({
  options = {},
  peerId,
  multiaddrs = [],
  repo,
  keychainConfig = {},
  config = {}
}) {
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

    if (!routers[router]) {
      throw errCode(new Error(`Router unavailable. Configure libp2p.modules.pubsub to use the ${router} router.`), 'ERR_NOT_SUPPORTED')
    }

    return routers[router]
  }

  const libp2pDefaults = {
    datastore,
    peerId: peerId,
    modules: {}
  }

  const libp2pOptions = {
    /**
     * @type {Partial<Libp2pOptions["modules"]>}
     */
    modules: {
      pubsub: getPubsubRouter(),
      contentRouting: [],
      peerRouting: []
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
        enabled: get(config, 'Routing.Type', 'dhtclient') !== 'none',
        clientMode: get(config, 'Routing.Type', 'dht') !== 'dhtserver',
        kBucketSize: get(options, 'dht.kBucketSize', 20),
        validators: {
          ipns: ipns.validator
        }
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
    libp2pConfig.modules.peerDiscovery.push(bootstrap)
  }

  // Set up Delegate Routing based on the presence of Delegates in the config
  const delegateHosts = get(options, 'config.Addresses.Delegates',
    get(config, 'Addresses.Delegates', [])
  )

  if (delegateHosts.length > 0) {
    // Pick a random delegate host
    const delegateString = delegateHosts[Math.floor(Math.random() * delegateHosts.length)]
    const delegateAddr = new Multiaddr(delegateString).toOptions()
    const delegateApiOptions = {
      host: delegateAddr.host,
      // port is a string atm, so we need to convert for the check
      // @ts-ignore - parseInt(input:string) => number
      protocol: parseInt(delegateAddr.port) === 443 ? 'https' : 'http',
      port: delegateAddr.port
    }

    const delegateHttpClient = ipfsHttpClient(delegateApiOptions)

    libp2pOptions.modules.contentRouting = libp2pOptions.modules.contentRouting || []
    libp2pOptions.modules.contentRouting.push(new DelegatedContentRouter(peerId, delegateHttpClient))

    libp2pOptions.modules.peerRouting = libp2pOptions.modules.peerRouting || []
    libp2pOptions.modules.peerRouting.push(new DelegatedPeerRouter(delegateHttpClient))
  }

  return libp2pConfig
}

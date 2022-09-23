import get from 'dlv'
import mergeOpts from 'merge-options'
import errCode from 'err-code'
import { routers } from 'ipfs-core-config/libp2p-pubsub-routers'
import { DelegatedPeerRouting } from '@libp2p/delegated-peer-routing'
import { DelegatedContentRouting } from '@libp2p/delegated-content-routing'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { multiaddr } from '@multiformats/multiaddr'
import { ipfsCore as pkgversion } from '../version.js'
import { libp2pConfig as getEnvLibp2pOptions } from 'ipfs-core-config/libp2p'
import { createLibp2p as createNode } from 'libp2p'
import { KadDHT } from '@libp2p/kad-dht'
import { Bootstrap } from '@libp2p/bootstrap'
import { ipnsValidator } from 'ipns/validator'
import { ipnsSelector } from 'ipns/selector'
import { WebSockets } from '@libp2p/websockets'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@chainsafe/libp2p-noise'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true, concatArrays: true })

/**
 * @typedef {object} DekOptions
 * @property {string} hash
 * @property {string} salt
 * @property {number} iterationCount
 * @property {number} keyLength
 *
 * @typedef {object} KeychainConfig
 * @property {string} [pass]
 * @property {DekOptions} [dek]
 *
 * @typedef {import('ipfs-repo').IPFSRepo} Repo
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 * @typedef {import('../types').Options} IPFSOptions
 * @typedef {import('libp2p').Libp2p} LibP2P
 * @typedef {import('libp2p').Libp2pOptions} Libp2pOptions
 * @typedef {import('ipfs-core-types/src/config').Config} IPFSConfig
 * @typedef {import('@multiformats/multiaddr').Multiaddr} Multiaddr
 */

/**
 * @param {object} config
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
  const { datastore } = repo

  const libp2pOptions = getLibp2pOptions({
    options,
    config,
    datastore,
    keychainConfig,
    peerId,
    multiaddrs
  })

  if (typeof options.libp2p === 'function') {
    return options.libp2p({ libp2pOptions, options, config, datastore, peerId })
  }

  return createNode(libp2pOptions)
}

/**
 * @param {object} input
 * @param {IPFSOptions} input.options
 * @param {Partial<IPFSConfig>} input.config
 * @param {Repo['datastore']} input.datastore
 * @param {KeychainConfig} input.keychainConfig
 * @param {PeerId} input.peerId
 * @param {Multiaddr[]} input.multiaddrs
 * @returns {Libp2pOptions}
 */
function getLibp2pOptions ({ options, config, datastore, keychainConfig, peerId, multiaddrs }) {
  const getPubsubRouter = () => {
    const router = get(config, 'Pubsub.Router') || 'gossipsub'

    const availableRouters = routers()

    if (!availableRouters[router]) {
      throw errCode(new Error(`Router unavailable. Configure libp2p.modules.pubsub to use the ${router} router.`), 'ERR_NOT_SUPPORTED')
    }

    return availableRouters[router]
  }

  /** @type {Libp2pOptions} */
  const libp2pDefaults = {
    datastore,
    peerId: peerId
  }

  /** @type {Libp2pOptions} */
  const libp2pOptions = {
    addresses: {
      listen: multiaddrs.map(ma => ma.toString()),
      announce: get(options, 'addresses.announce', get(config, 'Addresses.Announce', [])),
      noAnnounce: get(options, 'addresses.noAnnounce', get(config, 'Addresses.NoAnnounce', []))
    },
    connectionManager: get(options, 'connectionManager', {
      maxConnections: get(options, 'config.Swarm.ConnMgr.HighWater', get(config, 'Swarm.ConnMgr.HighWater')),
      minConnections: get(options, 'config.Swarm.ConnMgr.LowWater', get(config, 'Swarm.ConnMgr.LowWater'))
    }),
    keychain: keychainConfig,
    identify: {
      host: {
        agentVersion: `js-ipfs/${pkgversion}`
      }
    },
    contentRouters: [],
    peerRouters: [],
    peerDiscovery: [],
    transports: [],
    streamMuxers: [
      new Mplex({
        maxInboundStreams: 256,
        maxOutboundStreams: 1024
      })
    ],
    connectionEncryption: [
      new Noise()
    ],
    relay: {
      enabled: get(options, 'relay.enabled', get(config, 'relay.enabled', true)),
      hop: {
        enabled: get(options, 'relay.hop.enabled', get(config, 'relay.hop.enabled', false)),
        active: get(options, 'relay.hop.active', get(config, 'relay.hop.active', false))
      }
    },
    nat: {
      enabled: !get(config, 'Swarm.DisableNatPortMap', false)
    }
  }

  if (get(options, 'config.Pubsub.Enabled', get(config, 'Pubsub.Enabled', true))) {
    libp2pOptions.pubsub = getPubsubRouter()
  }

  if (get(config, 'Routing.Type', 'dhtclient') !== 'none') {
    libp2pOptions.dht = new KadDHT({
      clientMode: get(config, 'Routing.Type', 'dht') !== 'dhtserver',
      kBucketSize: get(options, 'dht.kBucketSize', 20),
      validators: {
        ipns: ipnsValidator
      },
      selectors: {
        ipns: ipnsSelector
      }
    })
  }

  const boostrapNodes = get(options, 'config.Bootstrap', get(config, 'Bootstrap', []))

  if (boostrapNodes.length > 0) {
    libp2pOptions.peerDiscovery?.push(
      new Bootstrap({
        list: boostrapNodes
      })
    )
  }

  /** @type {import('libp2p').Libp2pOptions | undefined} */
  let constructorOptions = get(options, 'libp2p', undefined)

  if (typeof constructorOptions === 'function') {
    constructorOptions = undefined
  }

  // Merge defaults with Node.js/browser/other environments options and configuration
  /** @type {Libp2pOptions} */
  const libp2pFinalConfig = mergeOptions(
    libp2pDefaults,
    getEnvLibp2pOptions(),
    libp2pOptions,
    constructorOptions
  )

  // Set up Delegate Routing based on the presence of Delegates in the config
  const delegateHosts = get(options, 'config.Addresses.Delegates',
    get(config, 'Addresses.Delegates', [])
  )

  if (delegateHosts.length > 0) {
    // Pick a random delegate host
    const delegateString = delegateHosts[Math.floor(Math.random() * delegateHosts.length)]
    const delegateAddr = multiaddr(delegateString).toOptions()
    const delegateApiOptions = {
      host: delegateAddr.host,
      // port is a string atm, so we need to convert for the check
      // @ts-expect-error - parseInt(input:string) => number
      protocol: parseInt(delegateAddr.port) === 443 ? 'https' : 'http',
      port: delegateAddr.port
    }

    const delegateHttpClient = ipfsHttpClient(delegateApiOptions)

    libp2pFinalConfig.contentRouters?.push(new DelegatedContentRouting(delegateHttpClient))
    libp2pFinalConfig.peerRouters?.push(new DelegatedPeerRouting(delegateHttpClient))
  }

  if (!get(options, 'config.Discovery.MDNS.Enabled', get(config, 'Discovery.MDNS.Enabled', true))) {
    libp2pFinalConfig.peerDiscovery = libp2pFinalConfig.peerDiscovery?.filter(d => {
      return d != null && d[Symbol.toStringTag] !== '@libp2p/mdns'
    })
  }

  if (libp2pFinalConfig.transports == null) {
    libp2pFinalConfig.transports = []
  }

  // add WebSocket transport if not overridden by user config
  if (libp2pFinalConfig.transports.find(t => t[Symbol.toStringTag] === '@libp2p/websockets') == null) {
    libp2pFinalConfig.transports.push(new WebSockets())
  }

  return libp2pFinalConfig
}

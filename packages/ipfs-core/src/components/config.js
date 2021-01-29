'use strict'

const getDefaultConfig = require('../runtime/config-nodejs.js')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const log = require('debug')('ipfs:core:config')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  return {
    getAll: withTimeoutOption(getAll),
    get: withTimeoutOption(get),
    set: withTimeoutOption(set),
    replace: withTimeoutOption(replace),
    profiles: {
      apply: withTimeoutOption(applyProfile),
      list: withTimeoutOption(listProfiles)
    }
  }

  /**
   * @param {AbortOptions} [options]
   */
  async function getAll (options = {}) { // eslint-disable-line require-await
    return repo.config.getAll(options)
  }

  /**
   *
   * @param {string} key
   * @param {AbortOptions} [options]
   */
  async function get (key, options) { // eslint-disable-line require-await
    if (!key) {
      return Promise.reject(new Error('key argument is required'))
    }

    return repo.config.get(key, options)
  }

  /**
   *
   * @param {string} key
   * @param {ToJSON} value
   * @param {AbortOptions} [options]
   */
  async function set (key, value, options) { // eslint-disable-line require-await
    return repo.config.set(key, value, options)
  }

  /**
   * @param {IPFSConfig} value
   * @param {AbortOptions} [options]
   */
  async function replace (value, options) { // eslint-disable-line require-await
    return repo.config.replace(value, options)
  }

  /**
   * @param {string} profileName
   * @param {*} options
   * @returns {Promise<{original: IPFSConfig, updated: IPFSConfig}>}
   */
  async function applyProfile (profileName, options = {}) {
    const { dryRun } = options

    const profile = profiles[profileName]

    if (!profile) {
      throw new Error(`No profile with name '${profileName}' exists`)
    }

    try {
      const oldCfg = await repo.config.getAll(options)
      let newCfg = JSON.parse(JSON.stringify(oldCfg)) // clone
      newCfg = profile.transform(newCfg)

      if (!dryRun) {
        await repo.config.replace(newCfg, options)
      }

      // Scrub private key from output
      // @ts-ignore `oldCfg.Identity` maybe undefined
      delete oldCfg.Identity.PrivKey
      delete newCfg.Identity.PrivKey

      return { original: oldCfg, updated: newCfg }
    } catch (err) {
      log(err)

      throw new Error(`Could not apply profile '${profileName}' to config: ${err.message}`)
    }
  }
}

/**
 * @param {any} _options
 * @returns {Promise<{name:string, description:string}[]>}
 */
async function listProfiles (_options) { // eslint-disable-line require-await
  return Object.keys(profiles).map(name => ({
    name,
    description: profiles[name].description
  }))
}

const profiles = {
  server: {
    description: 'Recommended for nodes with public IPv4 address (servers, VPSes, etc.), disables host and content discovery and UPnP in local networks.',
    /**
     * @param {IPFSConfig} config
     * @returns {IPFSConfig}
     */
    transform: (config) => {
      config.Discovery.MDNS.Enabled = false
      config.Discovery.webRTCStar.Enabled = false
      config.Swarm = {
        ...(config.Swarm || {}),
        DisableNatPortMap: true
      }

      return config
    }
  },
  'local-discovery': {
    description: 'Sets default values to fields affected by `server` profile, enables discovery and UPnP in local networks.',
    /**
     * @param {IPFSConfig} config
     * @returns {IPFSConfig}
     */
    transform: (config) => {
      config.Discovery.MDNS.Enabled = true
      config.Discovery.webRTCStar.Enabled = true
      config.Swarm = {
        ...(config.Swarm || {}),
        DisableNatPortMap: false
      }

      return config
    }
  },
  test: {
    description: 'Reduces external interference, useful for running ipfs in test environments. Note that with these settings node won\'t be able to talk to the rest of the network without manual bootstrap.',
    /**
     * @param {IPFSConfig} config
     * @returns {IPFSConfig}
     */
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Addresses.API = defaultConfig.Addresses.API ? '/ip4/127.0.0.1/tcp/0' : ''
      config.Addresses.Gateway = defaultConfig.Addresses.Gateway ? '/ip4/127.0.0.1/tcp/0' : ''
      config.Addresses.Swarm = defaultConfig.Addresses.Swarm.length ? ['/ip4/127.0.0.1/tcp/0'] : []
      config.Addresses.Delegates = []
      config.Bootstrap = []
      config.Discovery.MDNS.Enabled = false
      config.Discovery.webRTCStar.Enabled = false
      config.Swarm = {
        ...(config.Swarm || {}),
        DisableNatPortMap: true
      }

      return config
    }
  },
  'default-networking': {
    description: 'Restores default network settings. Inverse profile of the `test` profile.',
    /**
     * @param {IPFSConfig} config
     * @returns {IPFSConfig}
     */
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Addresses.API = defaultConfig.Addresses.API
      config.Addresses.Gateway = defaultConfig.Addresses.Gateway
      config.Addresses.Swarm = defaultConfig.Addresses.Swarm
      config.Addresses.Delegates = defaultConfig.Addresses.Delegates
      config.Bootstrap = defaultConfig.Bootstrap
      config.Discovery.MDNS.Enabled = defaultConfig.Discovery.MDNS.Enabled
      config.Discovery.webRTCStar.Enabled = defaultConfig.Discovery.webRTCStar.Enabled
      config.Swarm = {
        ...(config.Swarm || {}),
        DisableNatPortMap: false
      }

      return config
    }
  },
  lowpower: {
    description: 'Reduces daemon overhead on the system. May affect node functionality,performance of content discovery and data fetching may be degraded. Recommended for low power systems.',
    /**
     * @param {IPFSConfig} config
     * @returns {IPFSConfig}
     */
    transform: (config) => {
      const Swarm = config.Swarm || {}
      const ConnMgr = Swarm.ConnMgr || {}
      ConnMgr.LowWater = 20
      ConnMgr.HighWater = 40

      Swarm.ConnMgr = ConnMgr
      config.Swarm = Swarm

      return config
    }
  },
  'default-power': {
    description: 'Inverse of "lowpower" profile.',
    /**
     * @param {IPFSConfig} config
     * @returns {IPFSConfig}
     */
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Swarm = defaultConfig.Swarm

      return config
    }
  }

}

module.exports.profiles = profiles

/**
 * @typedef {Object} Config
 * @property {Get} get
 * @property {GetAll} getAll
 * @property {Set} set
 * @property {Replace} replace
 * @property {Profiles} profiles
 *
 * @callback Get
 * Returns the currently being used config. If the daemon is off, it returns
 * the stored config.
 *
 * @param {string} key - The key of the value that should be fetched from the
 * config file. If no key is passed, then the whole config will be returned.
 * @param {AbortOptions} [options]
 * @returns {Promise<ToJSON>} - An object containing the configuration of the IPFS node
 * @example
 * const config = await ipfs.config.get('Addresses.Swarm')
 * console.log(config)
 *
 *
 * @callback GetAll
 * Returns the full config been used. If the daemon is off, it returns the
 * stored config.
 *
 * @param {AbortOptions} [options]
 * @returns {Promise<IPFSConfig>}
 * @example
 * const config = await ipfs.config.getAll()
 * console.log(config)
 *
 * @callback Set
 * Adds or replaces a config value. Note that this operation will not spark the
 * restart of any service, i.e: if a config.replace changes the multiaddrs of
 * the Swarm, Swarm will have to be restarted manually for the changes to take
 * an effect.
 *
 * @param {string} key - The key of the value that should be added or replaced.
 * @param {ToJSON} value - The value to be set.
 * @param {AbortOptions} [options]
 * @returns {Promise<void>} - Promise succeeds if config change succeeded,
 * otherwise fails with error.
 * @example
 * // Disable MDNS Discovery
 * await ipfs.config.set('Discovery.MDNS.Enabled', false)
 *
 * @callback Replace
 * Adds or replaces a config file.
 *
 * Note that this operation will not spark the restart of any service,
 * i.e: if a config.replace changes the multiaddrs of the Swarm, Swarm will
 * have to be restarted manually for the changes to take an effect.
 *
 * @param {IPFSConfig} value - A new configuration.
 * @param {AbortOptions} [options]
 * @returns {Promise<void>}
 * @example
 * const newConfig = {
 *   Bootstrap: []
 * }
 * await ipfs.config.replace(newConfig)
 *
 * @typedef {Object} Profiles
 * @property {ListProfiles} list
 * @property {ApplyProfile} apply
 *
 * @callback ListProfiles
 * List available config profiles
 * @param {AbortOptions} [options]
 * @returns {Promise<Profile[]>} - An array with all the available config profiles
 * @example
 * const profiles = await ipfs.config.profiles.list()
 * profiles.forEach(profile => {
 *   console.info(profile.name, profile.description)
 * })
 *
 * @typedef {Object} Profile
 * @property {string} description
 * @property {string} name
 *
 *
 * @callback ApplyProfile
 * List available config profiles
 * @param {string} name
 * @param {ApplyOptions & AbortOptions} [options]
 * @returns {Promise<{original: IPFSConfig, updated: IPFSConfig}>}
 *
 * @typedef {Object} ApplyOptions
 * @property {boolean} [dryRun=false] - If true does not apply the profile
 *
 *
 * @typedef {Object} IPFSConfig
 * @property {AddressConfig} Addresses
 * @property {string} [Profiles]
 * @property {string[]} [Bootstrap]
 * @property {DiscoveryConfig} Discovery
 * @property {DatastoreConfig} [Datastore]
 * @property {IdentityConfig} [Identity]
 * @property {KeychainConfig} [Keychain]
 * @property {PubsubConfig} [Pubsub]
 * @property {SwarmConfig} [Swarm]
 * @property {RoutingConfig} [Routing]
 *
 * @typedef {Object} AddressConfig
 * Contains information about various listener addresses to be used by this node.
 * @property {APIAddress} [API='/ip4/127.0.0.1/tcp/5002']
 * @property {DelegateAddress} [Delegates=[]]
 * @property {GatewayAddress} [Gateway='/ip4/127.0.0.1/tcp/9090']
 * @property {SwarmAddress} [Swarm=['/ip4/0.0.0.0/tcp/4002', '/ip4/127.0.0.1/tcp/4003/ws']]
 * *
 * @typedef {string} Multiaddr
 * Composable and future-proof network address following [Multiaddr][]
 * specification.
 *
 * [Multiaddr]:https://github.com/multiformats/multiaddr/
 *
 * @typedef {Multiaddr|Multiaddr[]} APIAddress
 * The IPFS daemon exposes an [HTTP API][] that allows to control the node and
 * run the same commands as you can do from the command line. It is defined on
 * the [HTTP API][] Spec.
 *
 * [Multiaddr][] or array of [Multiaddr][] describing the address(es) to serve the
 * [HTTP API][] on.
 *
 * [Multiaddr]:https://github.com/multiformats/multiaddr/
 * [HTTP API]:https://docs.ipfs.io/reference/api/http
 *
 * @typedef {Multiaddr[]} DelegateAddress
 * Delegate peers are used to find peers and retrieve content from the network
 * on your behalf.
 *
 * Array of [Multiaddr][] describing which addresses to use as delegate nodes.
 *
 * [Multiaddr]:https://github.com/multiformats/multiaddr/
 *
 * @typedef {Multiaddr|Multiaddr[]} GatewayAddress
 * A gateway is exposed by the IPFS daemon, which allows an easy way to access
 * content from IPFS, using an IPFS path.
 *
 * [Multiaddr][] or array of [Multiaddr][] describing the address(es) to serve
 * the gateway on.
 *
 * [Multiaddr]:https://github.com/multiformats/multiaddr/
 *
 * @typedef {Multiaddr[]} SwarmAddress
 * Array of [Multiaddr][] describing which addresses to listen on for p2p swarm
 * connections.
 *
 * [Multiaddr]:https://github.com/multiformats/multiaddr/
 *
 *
 * @typedef {Multiaddr[]} BootstrapConfig
 * Bootstrap is an array of [Multiaddr][] of trusted nodes to connect to in order
 * to initiate a connection to the network.
 *
 * [Multiaddr]:https://github.com/multiformats/multiaddr/
 *
 * @typedef {Object} DatastoreConfig
 * Contains information related to the construction and operation of the on-disk
 * storage system.
 * @property {DatastoreSpec} [Spec]
 *
 * @typedef {Object} DatastoreSpec
 * Spec defines the structure of the IPFS datastore. It is a composable
 * structure, where each datastore is represented by a JSON object. Datastores
 * can wrap other datastores to provide extra functionality (e.g. metrics,
 * logging, or caching).
 *
 * This can be changed manually, however, if you make any changes that require
 * a different on-disk structure, you will need to run the [ipfs-ds-convert][]
 * tool to migrate data into the new structures.
 *
 * [ipfs-ds-convert]:https://github.com/ipfs/ipfs-ds-convert
 *
 * Default:
 * ```json
 * {
 *   "mounts": [
 *     {
 *       "child": {
 *         "path": "blocks",
 *        "shardFunc": "/repo/flatfs/shard/v1/next-to-last/2",
 *        "sync": true,
 *        "type": "flatfs"
 *      },
 *      "mountpoint": "/blocks",
 *      "prefix": "flatfs.datastore",
 *      "type": "measure"
 *    },
 *    {
 *      "child": {
 *        "compression": "none",
 *        "path": "datastore",
 *        "type": "levelds"
 *      },
 *      "mountpoint": "/",
 *      "prefix": "leveldb.datastore",
 *      "type": "measure"
 *    }
 *  ],
 *  "type": "mount"
 * }
 * ```
 *
 * @typedef {Object} DiscoveryConfig
 * Contains options for configuring IPFS node discovery mechanisms.
 * @property {MDNSDiscovery} MDNS
 * @property {WebRTCStarDiscovery} webRTCStar
 *
 * @typedef {Object} MDNSDiscovery
 * Multicast DNS is a discovery protocol that is able to find other peers on the local network.
 * @property {boolean} [Enabled=true] - A boolean value for whether or not MDNS
 * should be active.
 * @property {number} [Interval=10] - A number of seconds to wait between
 * discovery checks.
 *
 * @typedef {Object} WebRTCStarDiscovery
 * WebRTCStar is a discovery mechanism prvided by a signalling-star that allows
 * peer-to-peer communications in the browser.
 * @property {boolean} [Enabled=true] - A boolean value for whether or not
 * webRTCStar should be active.
 *
 * @typedef {Object} IdentityConfig
 * @property {PeerID} [PeerID]
 * @property {PrivateKey} [PrivKey]
 *
 * @typedef {string} PeerID
 * The unique PKI identity label for this configs peer. Set on init and never
 * read, its merely here for convenience. IPFS will always generate the peerID
 * from its keypair at runtime.
 *
 * @typedef {string} PrivateKey
 * The base64 encoded protobuf describing (and containing) the nodes private key.
 *
 * @typedef {Object} KeychainConfig
 * We can customize the key management and criptographically protected messages
 * by changing the Keychain options. Those options are used for generating the
 * derived encryption key (DEK).
 *
 * The DEK object, along with the passPhrase, is the input to a PBKDF2 function.
 *
 * You can check the [parameter choice for pbkdf2](https://cryptosense.com/parameter-choice-for-pbkdf2/)
 * for more information.
 * @property {DEK} DEK
 *
 * @typedef {Object} DEK
 * @property {number} keyLength
 * @property {number} iterationCount
 * @property {string} salt
 * @property {string} hash
 *
 * @typedef {Object} PubsubConfig
 * Options for configuring the pubsub subsystem. It is important pointing out
 * that this is not supported in the browser. If you want to configure a
 * different pubsub router in the browser you must configure
 * `libp2p.modules.pubsub` options instead.
 *
 * @property {PubSubRouter} [Router='gossipsub']
 * @property {boolean} [Enabled=true]
 *
 * @typedef {'gossipsub'|'floodsub'} PubSubRouter
 * A string value for specifying which pubsub routing protocol to use. You can
 * either use `'gossipsub'` in order to use the [ChainSafe/gossipsub-js]
 * (https://github.com/ChainSafe/gossipsub-js) implementation, or `'floodsub'`
 * to use the [libp2p/js-libp2p-floodsub](https://github.com/libp2p/js-libp2p-floodsub)
 * implementation.
 *
 * You can read more about these implementations on the [libp2p/specs/pubsub]
 * (https://github.com/libp2p/specs/tree/master/pubsub) document.
 *
 * @typedef {Object} SwarmConfig
 * Options for configuring the swarm.
 * @property {ConnMgrConfig} [ConnMgr]
 * @property {boolean} [DisableNatPortMap]
 *
 * @typedef {Object} ConnMgrConfig
 * The connection manager determines which and how many connections to keep and
 * can be configured to keep.
 *
 * The "basic" connection manager tries to keep between `LowWater` and
 * `HighWater` connections. It works by:
 *
 * 1. Keeping all connections until `HighWater` connections is reached.
 * 2. Once `HighWater` is reached, it closes connections until `LowWater` is
 * reached.
 *
 * @property {number} [LowWater=200] - The minimum number of connections to
 * maintain.
 * @property {number} [HighWater=500] - The number of connections that, when
 * exceeded, will trigger a connection GC operation.
 *
 * {{LowWater?:number, HighWater?:number}} ConnMgr
 *
 * @typedef {Object} RoutingConfig
 * @property {string} [Type]
 *
 * @typedef {import('ipfs-core-types/src/basic').ToJSON} ToJSON
 * @typedef {import('.').AbortOptions} AbortOptions
 */

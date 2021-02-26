'use strict'

const { mergeOptions } = require('../utils')
const { isTest } = require('ipfs-utils/src/env')
const log = require('debug')('ipfs')

const { DAGNode } = require('ipld-dag-pb')
const UnixFs = require('ipfs-unixfs')
const multicodec = require('multicodec')
const initAssets = require('../runtime/init-assets-nodejs')
const { AlreadyInitializedError } = require('../errors')

const createStartAPI = require('./start')
const createStopAPI = require('./stop')
const createDNSAPI = require('./dns')
const createIsOnlineAPI = require('./is-online')
const createResolveAPI = require('./resolve')
const PinAPI = require('./pin')
const IPNSAPI = require('./ipns')
const NameAPI = require('./name')
const createRefsAPI = require('./refs')
const createRefsLocalAPI = require('./refs/local')
const BitswapAPI = require('./bitswap')
const BootstrapAPI = require('./bootstrap')
const BlockAPI = require('./block')
const RootAPI = require('./root')
const createVersionAPI = require('./version')
const createIDAPI = require('./id')
const createConfigAPI = require('./config')
const DagAPI = require('./dag')
const PinManagerAPI = require('./pin/pin-manager')
const createPreloadAPI = require('../preload')
const createMfsPreloadAPI = require('../mfs-preload')
const createFilesAPI = require('./files')
const KeyAPI = require('./key')
const ObjectAPI = require('./object')
const RepoAPI = require('./repo')
const StatsAPI = require('./stats')
const IPFSBlockService = require('ipfs-block-service')
const createIPLD = require('./ipld')
const Storage = require('./storage')
const Network = require('./network')
const Service = require('../utils/service')
const SwarmAPI = require('./swarm')
const createGCLockAPI = require('./gc-lock')
const createPingAPI = require('./ping')
const createDHTAPI = require('./dht')
const createPubSubAPI = require('./pubsub')

class IPFS {
  /**
   * @param {Object} config
   * @param {Print} config.print
   * @param {StorageAPI} config.storage
   * @param {Options} config.options
   */
  constructor ({ print, storage, options }) {
    const { peerId, repo, keychain } = storage
    const network = Service.create(Network)

    const preload = createPreloadAPI(options.preload)

    /** @type {BlockService} */
    const blockService = new IPFSBlockService(storage.repo)
    const ipld = createIPLD({ blockService, print, options: options.ipld })

    const gcLock = createGCLockAPI({
      path: repo.path,
      repoOwner: options.repoOwner
    })
    const dns = createDNSAPI()
    const isOnline = createIsOnlineAPI({ network })
    // @ts-ignore This type check fails as options.
    // libp2p can be a function, while IPNS router config expects libp2p config
    const ipns = new IPNSAPI(options)
    const dagReader = DagAPI.reader({ ipld, preload })

    const name = new NameAPI({
      dns,
      ipns,
      dagReader,
      peerId,
      isOnline,
      keychain,
      options
    })
    const resolve = createResolveAPI({ ipld, name })
    const pinManager = new PinManagerAPI({ repo, dagReader })
    const pin = new PinAPI({ gcLock, pinManager, dagReader })
    const block = new BlockAPI({ blockService, preload, gcLock, pinManager, pin })
    const dag = new DagAPI({ ipld, preload, gcLock, pin, dagReader })
    const refs = Object.assign(createRefsAPI({ ipld, resolve, preload }), {
      local: createRefsLocalAPI({ repo: storage.repo })
    })
    const { add, addAll, cat, get, ls } = new RootAPI({
      gcLock,
      preload,
      pin,
      block,
      ipld,
      options: options.EXPERIMENTAL
    })

    const files = createFilesAPI({
      ipld,
      block,
      blockService,
      repo,
      preload,
      options
    })

    const mfsPreload = createMfsPreloadAPI({
      files,
      preload,
      options: options.preload
    })

    this.preload = preload
    this.name = name
    this.ipld = ipld
    this.ipns = ipns
    this.pin = pin
    this.resolve = resolve
    this.block = block
    this.refs = refs

    this.start = createStartAPI({
      network,
      peerId,
      repo,
      blockService,
      preload,
      ipns,
      mfsPreload,
      print,
      keychain,
      options
    })

    this.stop = createStopAPI({
      network,
      preload,
      mfsPreload,
      blockService,
      ipns,
      repo
    })

    this.dht = createDHTAPI({ network, repo })
    this.pubsub = createPubSubAPI({ network, config: options.config })
    this.dns = dns
    this.isOnline = isOnline
    this.id = createIDAPI({ network, peerId })
    this.version = createVersionAPI({ repo })
    this.bitswap = new BitswapAPI({ network })
    this.bootstrap = new BootstrapAPI({ repo })
    this.config = createConfigAPI({ repo })
    this.ping = createPingAPI({ network })

    this.add = add
    this.addAll = addAll
    this.cat = cat
    this.get = get
    this.ls = ls

    this.dag = dag
    this.files = files
    this.key = new KeyAPI({ keychain })
    this.object = new ObjectAPI({ ipld, preload, gcLock, dag })
    this.repo = new RepoAPI({ gcLock, pin, repo, refs })
    this.stats = new StatsAPI({ repo, network })
    this.swarm = new SwarmAPI({ network })

    // For the backwards compatibility
    Object.defineProperty(this, 'libp2p', {
      get () {
        const net = network.try()
        return net ? net.libp2p : undefined
      }
    })
  }

  /**
   * `IPFS.create` will do the initialization. Keep this around for backwards
   * compatibility.
   *
   * @deprecated
   */
  async init () { // eslint-disable-line require-await
    throw new AlreadyInitializedError()
  }

  /**
   * @param {Options} options
   */
  static async create (options = {}) {
    options = mergeOptions(getDefaultOptions(), options)

    // eslint-disable-next-line no-console
    const print = options.silent ? log : console.log

    const init = {
      ...mergeOptions(initOptions(options), options),
      print
    }

    const storage = await Storage.start(init)
    const config = await storage.repo.config.getAll()

    const ipfs = new IPFS({
      storage,
      print,
      options: { ...options, config }
    })

    await ipfs.preload.start()

    ipfs.ipns.startOffline(storage)
    if (storage.isNew && !init.emptyRepo) {
      // add empty unixfs dir object (go-ipfs assumes this exists)
      const cid = await addEmptyDir(ipfs)

      log('adding default assets')
      await initAssets({ addAll: ipfs.addAll, print })

      log('initializing IPNS keyspace')
      await ipfs.ipns.initializeKeyspace(storage.peerId.privKey, cid.toString())
    }

    if (options.start !== false) {
      await ipfs.start()
    }

    return ipfs
  }
}
module.exports = IPFS

/**
 * @param {Options} options
 * @returns {InitOptions}
 */
const initOptions = ({ init }) =>
  typeof init === 'object' ? init : {}

/**
 * @param {IPFS} ipfs
 */
const addEmptyDir = async (ipfs) => {
  const node = new DAGNode(new UnixFs('directory').marshal())
  const cid = await ipfs.dag.put(node, {
    version: 0,
    format: multicodec.DAG_PB,
    hashAlg: multicodec.SHA2_256,
    preload: false
  })

  await ipfs.pin.add(cid)

  return cid
}

/**
 * @returns {Options}
 */
const getDefaultOptions = () => ({
  start: true,
  EXPERIMENTAL: {},
  preload: {
    enabled: !isTest, // preload by default, unless in test env
    addresses: [
      '/dns4/node0.preload.ipfs.io/https',
      '/dns4/node1.preload.ipfs.io/https',
      '/dns4/node2.preload.ipfs.io/https',
      '/dns4/node3.preload.ipfs.io/https'
    ]
  }
})

/**
 * @typedef {StorageOptions & IPFSOptions} Options
 *
 * @typedef {Object} IPFSOptions
 * Options argument can be used to specify advanced configuration.
 * @property {InitOptions} [init] - Initialization options
 * the IPFS node.
 * Note that *initializing* a repo is different from creating an instance of
 * [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor
 * sets many special properties when initializing a repo, so you should usually
 * not try and call `repoInstance.init()` yourself.
 * @property {boolean} [start=true] - If `false`, do not automatically
 * start the IPFS node. Instead, you’ll need to manually call
 * [`node.start()`](https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/MODULE.md#nodestart)
 * yourself.
 * @property {string} [pass=null] - A passphrase to encrypt/decrypt your keys.
 * @property {boolean} [silent=false] - Prevents all logging output from the
 * IPFS node. (Default: `false`)
 * @property {RelayOptions} [relay={ enabled: true, hop: { enabled: false, active: false } }]
 * - Configure circuit relay (see the [circuit relay tutorial]
 * (https://github.com/ipfs/js-ipfs/tree/master/examples/circuit-relaying)
 * to learn more).
 * @property {boolean} [offline=false] - Run ipfs node offline. The node does
 * not connect to the rest of the network but provides a local API.
 * @property {PreloadOptions} [preload] - Configure remote preload nodes.
 * The remote will preload content added on this node, and also attempt to
 * preload objects requested by this node.
 * @property {ExperimentalOptions} [EXPERIMENTAL] - Enable and configure
 * experimental features.
 * @property {IPFSConfig} [config] - Modify the default IPFS node config. This
 * object will be *merged* with the default config; it will not replace it.
 * (Default: [`config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-nodejs.js)
 * in Node.js, [`config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-browser.js)
 * in browsers)
 * @property {IPLDOptions} [ipld] - Modify the default IPLD config. This object
 * will be *merged* with the default config; it will not replace it. Check IPLD
 * [docs](https://github.com/ipld/js-ipld#ipld-constructor) for more information
 * on the available options. (Default: [`ipld.js`]
 * (https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld-nodejs.js) in Node.js, [`ipld-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld-browser.js)
 * (https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld.js)
 * in browsers)
 * @property {LibP2POptions|Function} [libp2p] - The libp2p option allows you to build
 * your libp2p node by configuration, or via a bundle function. If you are
 * looking to just modify the below options, using the object format is the
 * quickest way to get the default features of libp2p. If you need to create a
 * more customized libp2p node, such as with custom transports or peer/content
 * routers that need some of the ipfs data on startup, a custom bundle is a
 * great way to achieve this.
 * - You can see the bundle in action in the [custom libp2p example](https://github.com/ipfs/js-ipfs/tree/master/examples/custom-libp2p).
 * - Please see [libp2p/docs/CONFIGURATION.md](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md)
 * for the list of options libp2p supports.
 * - Default: [`libp2p-nodejs.js`](../src/core/runtime/libp2p-nodejs.js)
 * in Node.js, [`libp2p-browser.js`](../src/core/runtime/libp2p-browser.js) in
 * browsers.
 * @property {boolean} [repoOwner]
 *
 * @typedef {object} ExperimentalOptions
 * @property {boolean} [ipnsPubsub] - Enable pub-sub on IPNS. (Default: `false`)
 * @property {boolean} [sharding] - Enable directory sharding. Directories that have many child objects will be represented by multiple DAG nodes instead of just one. It can improve lookup performance when a directory has several thousand files or more. (Default: `false`)
 *
 *
 * @typedef {import('./storage').StorageOptions} StorageOptions
 * @typedef {import('../preload').Options} PreloadOptions
 * @typedef {import('./ipld').Options} IPLDOptions
 * @typedef {import('./libp2p').Options} LibP2POptions
 *
 * @typedef {object} RelayOptions
 * @property {boolean} [enabled] - Enable circuit relay dialer and listener. (Default: `true`)
 * @property {object} [hop]
 * @property {boolean} [hop.enabled] - Make this node a relay (other nodes can connect *through* it). (Default: `false`)
 * @property {boolean} [hop.active] - Make this an *active* relay node. Active relay nodes will attempt to dial a destin
 *
 * @typedef {import('./storage').InitOptions} InitOptions
 *
 * @typedef {import('./storage')} StorageAPI
 *
 * @typedef {import('./network').Options} NetworkOptions
 * @typedef {Service<NetworkOptions, Network>} NetworkService
 * @typedef {import('./storage').Repo} Repo
 * @typedef {(...args:any[]) => void} Print
 * @typedef {import('./storage').Keychain} Keychain
 * @typedef {import('./config').IPFSConfig} IPFSConfig
 *
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('./libp2p').LibP2P} LibP2P
 * @typedef {import('./pin/pin-manager')} PinManager
 * @typedef {import('ipfs-core-types/src/block-service').BlockService} BlockService
 * @typedef {import('ipfs-core-types/src/bitswap').Bitswap} BitSwap
 * @typedef {import('./ipld').IPLD} IPLD
 * @typedef {import('./gc-lock').GCLock} GCLock
 * @typedef {import('../preload').Preload} Preload
 * @typedef {import('../mfs-preload').MFSPreload} MFSPreload
 * @typedef {import('./ipns')} IPNS
 * @typedef {import('./pin')} Pin
 * @typedef {import('./block')} Block
 * @typedef {import('./dag').DagReader} DagReader
 * @typedef {import('./dag')} Dag
 * @typedef {ReturnType<typeof import('./files')>} Files
 * @typedef {ReturnType<typeof createIsOnlineAPI>} IsOnline
 * @typedef {ReturnType<typeof createResolveAPI>} Resolve
 * @typedef {ReturnType<typeof createRefsAPI>} Refs
 * @typedef {ReturnType<typeof createDNSAPI>} DNS
 * @typedef {import('./name')} Name
 * @typedef {import('../utils').AbortOptions} AbortOptions
 * @typedef {import('cids')} CID
 * @typedef {import('multiaddr')} Multiaddr
 * @typedef {import('./ipld').Block} IPLDBlock
 */

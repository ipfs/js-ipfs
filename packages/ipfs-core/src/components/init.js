'use strict'

const log = require('debug')('ipfs:components:init')
const PeerId = require('peer-id')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const mergeOptions = require('merge-options')
const getDefaultConfig = require('../runtime/config-nodejs.js')
const createRepo = require('../runtime/repo-nodejs')
const mortice = require('mortice')
const { DAGNode } = require('ipld-dag-pb')
const UnixFs = require('ipfs-unixfs')
const multicodec = require('multicodec')
const {
  AlreadyInitializingError,
  AlreadyInitializedError,
  NotStartedError,
  NotEnabledError
} = require('../errors')
const BlockService = require('ipfs-block-service')

/**
 * @typedef {import('.').IPLD} IPLD
 */
const Ipld = require('ipld')
const getDefaultIpldOptions = require('../runtime/ipld')

const createPreloader = require('../preload')
const { ERR_REPO_NOT_INITIALIZED } = require('ipfs-repo').errors
const IPNS = require('../ipns')
const OfflineDatastore = require('../ipns/routing/offline-datastore')
const initAssets = require('../runtime/init-assets-nodejs')
const PinManager = require('./pin/pin-manager')
const Components = require('./')

/**
 * @param {Object} config
 * @param {import('../api-manager')} config.apiManager
 * @param {(...args:any[]) => void} config.print
 * @param {ConstructorOptions<boolean | InitOptions, boolean>} config.options
 */
module.exports = ({
  apiManager,
  print,
  options: constructorOptions
}) =>
/**
 * @param {Object} options
 */
  async function init (options = {}) {
    const { cancel } = apiManager.update({ init: () => { throw new AlreadyInitializingError() } })

    try {
      if (typeof constructorOptions.init === 'object') {
        options = mergeOptions(constructorOptions.init, options)
      }

      options.pass = options.pass || constructorOptions.pass

      if (constructorOptions.config) {
        options.config = mergeOptions(options.config, constructorOptions.config)
      }

      options.repo = options.repo || constructorOptions.repo
      options.repoAutoMigrate = options.repoAutoMigrate || constructorOptions.repoAutoMigrate

      const repo = typeof options.repo === 'string' || options.repo == null
        ? createRepo({ path: options.repo, autoMigrate: options.repoAutoMigrate, silent: constructorOptions.silent })
        : options.repo

      let isInitialized = true

      if (repo.closed) {
        try {
          await repo.open()
        } catch (err) {
          if (err.code === ERR_REPO_NOT_INITIALIZED) {
            isInitialized = false
          } else {
            throw err
          }
        }
      }

      if (!isInitialized && options.allowNew === false) {
        throw new NotEnabledError('new repo initialization is not enabled')
      }

      const { peerId, keychain } = isInitialized
        ? await initExistingRepo(repo, options)
        : await initNewRepo(repo, { ...options, print })

      log('peer created')

      const blockService = new BlockService(repo)
      const ipld = new Ipld(getDefaultIpldOptions(blockService, constructorOptions.ipld, log))

      const preload = createPreloader(constructorOptions.preload)
      await preload.start()

      // Make sure GC lock is specific to repo, for tests where there are
      // multiple instances of IPFS
      const gcLock = mortice(repo.path, { singleProcess: constructorOptions.repoOwner !== false })
      const dag = {
        get: Components.dag.get({ ipld, preload }),
        resolve: Components.dag.resolve({ ipld, preload }),
        tree: Components.dag.tree({ ipld, preload }),
        // FIXME: resolve this circular dependency
        get put () {
          const put = Components.dag.put({ ipld, pin, gcLock, preload })
          Object.defineProperty(this, 'put', { value: put })
          return put
        }
      }

      const object = {
        data: Components.object.data({ ipld, preload }),
        get: Components.object.get({ ipld, preload }),
        links: Components.object.links({ dag }),
        new: Components.object.new({ ipld, preload }),
        patch: {
          addLink: Components.object.patch.addLink({ ipld, gcLock, preload }),
          appendData: Components.object.patch.appendData({ ipld, gcLock, preload }),
          rmLink: Components.object.patch.rmLink({ ipld, gcLock, preload }),
          setData: Components.object.patch.setData({ ipld, gcLock, preload })
        },
        put: Components.object.put({ ipld, gcLock, preload }),
        stat: Components.object.stat({ ipld, preload })
      }

      const pinManager = new PinManager(repo, dag)
      const pinAddAll = Components.pin.addAll({ pinManager, gcLock, dag })
      const pinRmAll = Components.pin.rmAll({ pinManager, gcLock, dag })

      const pin = {
        add: Components.pin.add({ addAll: pinAddAll }),
        addAll: pinAddAll,
        ls: Components.pin.ls({ pinManager, dag }),
        rm: Components.pin.rm({ rmAll: pinRmAll }),
        rmAll: pinRmAll
      }

      const block = {
        get: Components.block.get({ blockService, preload }),
        put: Components.block.put({ blockService, pin, gcLock, preload }),
        rm: Components.block.rm({ blockService, gcLock, pinManager }),
        stat: Components.block.stat({ blockService, preload })
      }

      const addAll = Components.addAll({ block, preload, pin, gcLock, options: constructorOptions })

      if (!isInitialized && !options.emptyRepo) {
      // add empty unixfs dir object (go-ipfs assumes this exists)
        const emptyDirCid = await addEmptyDir({ dag, pin })

        log('adding default assets')
        await initAssets({ addAll, print })

        log('initializing IPNS keyspace')
        // Setup the offline routing for IPNS.
        // This is primarily used for offline ipns modifications, such as the initializeKeyspace feature.
        const offlineDatastore = new OfflineDatastore(repo)
        const ipns = new IPNS(offlineDatastore, repo.datastore, peerId, keychain, { pass: options.pass })
        await ipns.initializeKeyspace(peerId.privKey, emptyDirCid.toString())
      }

      const api = createApi({
        add: Components.add({ addAll }),
        addAll,
        apiManager,
        constructorOptions,
        block,
        blockService,
        dag,
        gcLock,
        initOptions: options,
        ipld,
        keychain,
        object,
        peerId,
        pin,
        pinManager,
        preload,
        print,
        repo
      })

      return apiManager.update(api, () => { throw new NotStartedError() }).api
    } catch (err) {
      cancel()
      throw err
    }
  }

/**
 * @param {IPFSRepo} repo
 * @param {Object} options
 * @param {PrivateKey} options.privateKey
 * @param {boolean} [options.emptyRepo]
 * @param {number} [options.bits=2048] - Number of bits to use in the generated key
 * @param {string[]} options.profiles
 * @param {IPFSConfig} options.config
 * @param {string} [options.pass]
 * @param {(...args:any[]) => void} options.print
 * @param {KeyType} [options.algorithm='RSA']
 */
async function initNewRepo (repo, { privateKey, emptyRepo, algorithm, bits, profiles, config, pass, print }) {
  emptyRepo = emptyRepo || false
  bits = bits == null ? 2048 : Number(bits)

  // @ts-ignore https://github.com/schnittstabil/merge-options/pull/26
  config = mergeOptions(applyProfiles(profiles, getDefaultConfig()), config)

  // Verify repo does not exist yet
  const exists = await repo.exists()
  log('repo exists?', exists)

  if (exists === true) {
    throw new Error('repo already exists')
  }

  const peerId = await createPeerId({ privateKey, algorithm, bits, print })

  log('identity generated')

  config.Identity = {
    PeerID: peerId.toB58String(),
    PrivKey: uint8ArrayToString(peerId.privKey.bytes, 'base64pad')
  }

  log('peer identity: %s', config.Identity.PeerID)

  await repo.init(config)
  await repo.open()

  log('repo opened')

  // Create libp2p for Keychain creation
  const libp2p = Components.libp2p({
    peerId,
    repo,
    config,
    keychainConfig: {
      pass
    }
  })

  if (libp2p.keychain && libp2p.keychain.opts) {
    await libp2p.loadKeychain()

    await repo.config.set('Keychain', {
      dek: libp2p.keychain.opts.dek
    })
  }

  return { peerId, keychain: libp2p.keychain }
}

/**
 * @param {IPFSRepo} repo
 * @param {Object} options
 * @param {IPFSConfig} [options.config]
 * @param {string[]} [options.profiles]
 * @param {string} [options.pass]
 */
async function initExistingRepo (repo, { config: newConfig, profiles, pass }) {
  let config = await repo.config.getAll()

  if (newConfig || profiles) {
    if (profiles) {
      config = applyProfiles(profiles, config)
    }
    if (newConfig) {
      // @ts-ignore https://github.com/schnittstabil/merge-options/pull/26
      config = mergeOptions(config, newConfig)
    }
    await repo.config.set(config)
  }

  const peerId = await PeerId.createFromPrivKey(config.Identity.PrivKey)

  const libp2p = Components.libp2p({
    peerId,
    repo,
    config,
    keychainConfig: {
      pass,
      ...config.Keychain
    }
  })

  libp2p.keychain && await libp2p.loadKeychain()

  return { peerId, keychain: libp2p.keychain }
}

/**
 * @param {Object} options
 * @param {KeyType} [options.algorithm='RSA']
 * @param {PrivateKey} options.privateKey
 * @param {number} options.bits
 * @param {(...args:any[]) => void} options.print
 */
function createPeerId ({ privateKey, algorithm = 'RSA', bits, print }) {
  if (privateKey) {
    log('using user-supplied private-key')
    return typeof privateKey === 'object'
      ? privateKey
      : PeerId.createFromPrivKey(uint8ArrayFromString(privateKey, 'base64pad'))
  } else {
    // Generate peer identity keypair + transform to desired format + add to config.
    print('generating %s-bit (rsa only) %s keypair...', bits, algorithm)
    // @ts-ignore - expects "Ed25519" | "RSA" | "secp256k1" instoad of string
    return PeerId.create({ keyType: algorithm, bits })
  }
}

async function addEmptyDir ({ dag, pin }) {
  const node = new DAGNode(new UnixFs('directory').marshal())
  const cid = await dag.put(node, {
    version: 0,
    format: multicodec.DAG_PB,
    hashAlg: multicodec.SHA2_256,
    preload: false
  })
  await pin.add(cid)

  return cid
}

// Apply profiles (e.g. ['server', 'lowpower']) to config
function applyProfiles (profiles, config) {
  return (profiles || []).reduce((config, name) => {
    const profile = require('./config').profiles[name]
    if (!profile) {
      throw new Error(`Could not find profile with name '${name}'`)
    }
    log('applying profile %s', name)
    return profile.transform(config)
  }, config)
}

function createApi ({
  add,
  addAll,
  apiManager,
  constructorOptions,
  block,
  blockService,
  dag,
  gcLock,
  initOptions,
  ipld,
  keychain,
  object,
  peerId,
  pin,
  pinManager,
  preload,
  print,
  repo
}) {
  const notStarted = async () => { // eslint-disable-line require-await
    throw new NotStartedError()
  }

  const resolve = Components.resolve({ ipld })
  const refs = Object.assign(Components.refs({ ipld, resolve, preload }), {
    local: Components.refs.local({ repo })
  })

  const api = {
    add,
    addAll,
    bitswap: {
      stat: notStarted,
      unwant: notStarted,
      wantlist: notStarted,
      wantlistForPeer: notStarted
    },
    bootstrap: {
      add: Components.bootstrap.add({ repo }),
      list: Components.bootstrap.list({ repo }),
      rm: Components.bootstrap.rm({ repo })
    },
    block,
    cat: Components.cat({ ipld, preload }),
    config: Components.config({ repo }),
    dag,
    dns: Components.dns(),
    files: Components.files({ ipld, block, blockService, repo, preload, options: constructorOptions }),
    get: Components.get({ ipld, preload }),
    id: Components.id({ peerId }),
    init: async () => { throw new AlreadyInitializedError() }, // eslint-disable-line require-await
    isOnline: Components.isOnline({}),
    key: {
      export: Components.key.export({ keychain }),
      gen: Components.key.gen({ keychain }),
      import: Components.key.import({ keychain }),
      info: Components.key.info({ keychain }),
      list: Components.key.list({ keychain }),
      rename: Components.key.rename({ keychain }),
      rm: Components.key.rm({ keychain })
    },
    ls: Components.ls({ ipld, preload }),
    object,
    pin,
    refs,
    repo: {
      gc: Components.repo.gc({ gcLock, pin, refs, repo }),
      stat: Components.repo.stat({ repo }),
      version: Components.repo.version({ repo })
    },
    resolve,
    start: Components.start({
      apiManager,
      options: constructorOptions,
      blockService,
      gcLock,
      initOptions,
      ipld,
      keychain,
      peerId,
      pinManager,
      preload,
      print,
      repo
    }),
    stats: {
      bitswap: notStarted,
      bw: notStarted,
      repo: Components.repo.stat({ repo })
    },
    stop: () => {},
    swarm: {
      addrs: notStarted,
      connect: notStarted,
      disconnect: notStarted,
      localAddrs: Components.swarm.localAddrs({ multiaddrs: [] }),
      peers: notStarted
    },
    version: Components.version({ repo })
  }

  return api
}

/**
 * @template {boolean | InitOptions} Init
 * @template {boolean} Start
 *
 * @typedef {Object} ConstructorOptions
 * Options argument can be used to specify advanced configuration.
 * @property {RepoOption} [repo='~/.jsipfs']
 * @property {boolean} [repoAutoMigrate=true] - `js-ipfs` comes bundled with a
 * tool that automatically migrates your IPFS repository when a new version is
 * available.
 * @property {Init} [init=true] - Perform repo initialization steps when creating
 * the IPFS node.
 * Note that *initializing* a repo is different from creating an instance of
 * [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor
 * sets many special properties when initializing a repo, so you should usually
 * not try and call `repoInstance.init()` yourself.
 * @property {Start} [start=true] - If `false`, do not automatically
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
 * @property {object} [config] - Modify the default IPFS node config. This
 * object will be *merged* with the default config; it will not replace it.
 * (Default: [`config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-nodejs.js)
 * in Node.js, [`config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-browser.js)
 * in browsers)
 * @property {import('.').IPLDConfig} [ipld] - Modify the default IPLD config. This object
 * will be *merged* with the default config; it will not replace it. Check IPLD
 * [docs](https://github.com/ipld/js-ipld#ipld-constructor) for more information
 * on the available options. (Default: [`ipld.js`]
 * (https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld.js)
 * in browsers)
 * @property {object|Function} [libp2p] - The libp2p option allows you to build
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
 *
 * @property {boolean} [repoOwner]
 */

/**
 * @typedef {IPFSRepo|string} RepoOption
 * The file path at which to store the IPFS node’s data. Alternatively, you
 * can set up a customized storage system by providing an `ipfs.Repo` instance.
 *
 * @example
 * ```js
 * // Store data outside your user directory
 * const node = await IPFS.create({ repo: '/var/ipfs/data' })
 * ```
 *
 * @typedef {object} RelayOptions
 * @property {boolean} [enabled] - Enable circuit relay dialer and listener. (Default: `true`)
 * @property {object} [hop]
 * @property {boolean} [hop.enabled] - Make this node a relay (other nodes can connect *through* it). (Default: `false`)
 * @property {boolean} [hop.active] - Make this an *active* relay node. Active relay nodes will attempt to dial a destination peer even if that peer is not yet connected to the relay. (Default: `false`)
 *
 * @typedef {object} PreloadOptions
 * @property {boolean} [enabled] - Enable content preloading (Default: `true`)
 * @property {number} [interval]
 * @property {string[]} [addresses] - Multiaddr API addresses of nodes that should preload content.
 * **NOTE:** nodes specified here should also be added to your node's bootstrap address list at `config.Boostrap`.
 *
 * @typedef {object} ExperimentalOptions
 * @property {boolean} [ipnsPubsub] - Enable pub-sub on IPNS. (Default: `false`)
 * @property {boolean} [sharding] - Enable directory sharding. Directories that have many child objects will be represented by multiple DAG nodes instead of just one. It can improve lookup performance when a directory has several thousand files or more. (Default: `false`)
 *
 * @typedef {Object} InitOptions
 * @property {boolean} [emptyRepo=false] - Whether to remove built-in assets,
 * like the instructional tour and empty mutable file system, from the repo.
 * @property {number} [bits=2048] - Number of bits to use in the generated key
 * pair (rsa only).
 * @property {PrivateKey} [privateKey] - A pre-generated private key to use.
 * **NOTE: This overrides `bits`.**
 * @property {string} [pass] - A passphrase to encrypt keys. You should
 * generally use the top-level `pass` option instead of the `init.pass`
 * option (this one will take its value from the top-level option if not set).
 * @property {string[]} [profiles] - Apply profile settings to config.
 * @property {boolean} [allowNew=true] - Set to `false` to disallow
 * initialization if the repo does not already exist.
 * @property {IPFSConfig} [config]
 *
 * @typedef {import('./config').IPFSConfig} IPFSConfig
 * @typedef {import('.').IPFSRepo} IPFSRepo
 *
 * @typedef {'RSA' | 'ed25519' | 'secp256k1'} KeyType
 *
 * @typedef {string|PeerId} PrivateKey
 * Can be either a base64 string or a [PeerId](https://github.com/libp2p/js-peer-id)
 * instance.
 *
 * @typedef {import('libp2p').Keychain} Keychain
 */

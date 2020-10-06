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
const Ipld = require('ipld')
const getDefaultIpldOptions = require('../runtime/ipld-nodejs')
const createPreloader = require('../preload')
const { ERR_REPO_NOT_INITIALIZED } = require('ipfs-repo').errors
const IPNS = require('../ipns')
const OfflineDatastore = require('../ipns/routing/offline-datastore')
const initAssets = require('../runtime/init-assets-nodejs')
const PinManager = require('./pin/pin-manager')
const Components = require('./')

module.exports = ({
  apiManager,
  print,
  options: constructorOptions
}) => async function init (options) {
  const { cancel } = apiManager.update({ init: () => { throw new AlreadyInitializingError() } })

  try {
    options = options || {}

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
      tree: Components.dag.tree({ ipld, preload })
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

    // FIXME: resolve this circular dependency
    dag.put = Components.dag.put({ ipld, pin, gcLock, preload })

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

    apiManager.update(api, () => { throw new NotStartedError() })

    /** @type {typeof api} */
    const initializedApi = apiManager.api
    return initializedApi
  } catch (err) {
    cancel()
    throw err
  }
}

async function initNewRepo (repo, { privateKey, emptyRepo, algorithm, bits, profiles, config, pass, print }) {
  emptyRepo = emptyRepo || false
  bits = bits == null ? 2048 : Number(bits)

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

  privateKey = peerId.privKey

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

async function initExistingRepo (repo, { config: newConfig, profiles, pass }) {
  let config = await repo.config.getAll()

  if (newConfig || profiles) {
    if (profiles) {
      config = applyProfiles(profiles, config)
    }
    if (newConfig) {
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

function createPeerId ({ privateKey, algorithm = 'rsa', bits, print }) {
  if (privateKey) {
    log('using user-supplied private-key')
    return typeof privateKey === 'object'
      ? privateKey
      : PeerId.createFromPrivKey(uint8ArrayFromString(privateKey, 'base64pad'))
  } else {
    // Generate peer identity keypair + transform to desired format + add to config.
    print('generating %s-bit (rsa only) %s keypair...', bits, algorithm)
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
  const refs = Components.refs({ ipld, resolve, preload })
  refs.local = Components.refs.local({ repo })

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
      gc: Components.repo.gc({ gcLock, pin, pinManager, refs, repo }),
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

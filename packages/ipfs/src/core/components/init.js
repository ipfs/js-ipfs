'use strict'

const log = require('debug')('ipfs:components:init')
const PeerId = require('peer-id')
const mergeOptions = require('merge-options')
const getDefaultConfig = require('../runtime/config-nodejs.js')
const createRepo = require('../runtime/repo-nodejs')
const Keychain = require('libp2p-keychain')
const NoKeychain = require('./no-keychain')
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
      ? createRepo({ path: options.repo, autoMigrate: options.repoAutoMigrate })
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
    await pinManager.load()

    const pin = {
      add: Components.pin.add({ pinManager, gcLock, dag }),
      ls: Components.pin.ls({ pinManager, dag }),
      rm: Components.pin.rm({ pinManager, gcLock, dag })
    }

    // FIXME: resolve this circular dependency
    dag.put = Components.dag.put({ ipld, pin, gcLock, preload })

    const block = {
      get: Components.block.get({ blockService, preload }),
      put: Components.block.put({ blockService, gcLock, preload }),
      rm: Components.block.rm({ blockService, gcLock, pinManager }),
      stat: Components.block.stat({ blockService, preload })
    }

    const add = Components.add({ block, preload, pin, gcLock, options: constructorOptions })

    if (!isInitialized && !options.emptyRepo) {
      // add empty unixfs dir object (go-ipfs assumes this exists)
      const emptyDirCid = await addEmptyDir({ dag })

      log('adding default assets')
      await initAssets({ add, print })

      log('initializing IPNS keyspace')
      // Setup the offline routing for IPNS.
      // This is primarily used for offline ipns modifications, such as the initializeKeyspace feature.
      const offlineDatastore = new OfflineDatastore(repo)
      const ipns = new IPNS(offlineDatastore, repo.datastore, peerId, keychain, { pass: options.pass })
      await ipns.initializeKeyspace(peerId.privKey, emptyDirCid.toString())
    }

    const api = createApi({
      add,
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
  } catch (err) {
    cancel()
    throw err
  }

  return apiManager.api
}

async function initNewRepo (repo, { privateKey, emptyRepo, bits, profiles, config, pass, print }) {
  emptyRepo = emptyRepo || false
  bits = bits == null ? 2048 : Number(bits)

  config = mergeOptions(applyProfiles(profiles, getDefaultConfig()), config)

  // Verify repo does not exist yet
  const exists = await repo.exists()
  log('repo exists?', exists)

  if (exists === true) {
    throw new Error('repo already exists')
  }

  const peerId = await createPeerId({ privateKey, bits, print })
  let keychain = new NoKeychain()

  log('identity generated')

  config.Identity = {
    PeerID: peerId.toB58String(),
    PrivKey: peerId.privKey.bytes.toString('base64')
  }

  privateKey = peerId.privKey

  config.Keychain = Keychain.generateOptions()

  log('peer identity: %s', config.Identity.PeerID)

  await repo.init(config)
  await repo.open()

  log('repo opened')

  if (pass) {
    log('creating keychain')
    const keychainOptions = { passPhrase: pass, ...config.Keychain }
    keychain = new Keychain(repo.keys, keychainOptions)
    await keychain.importPeer('self', { privKey: privateKey })
  }

  return { peerId, keychain }
}

async function initExistingRepo (repo, { config: newConfig, profiles, pass }) {
  let config = await repo.config.get()

  if (newConfig || profiles) {
    if (profiles) {
      config = applyProfiles(profiles, config)
    }
    if (newConfig) {
      config = mergeOptions(config, newConfig)
    }
    await repo.config.set(config)
  }

  let keychain = new NoKeychain()

  if (pass) {
    const keychainOptions = { passPhrase: pass, ...config.Keychain }
    keychain = new Keychain(repo.keys, keychainOptions)
    log('keychain constructed')
  }

  const peerId = await PeerId.createFromPrivKey(config.Identity.PrivKey)

  // Import the private key as 'self', if needed.
  if (pass) {
    try {
      await keychain.findKeyByName('self')
    } catch (err) {
      log('Creating "self" key')
      await keychain.importPeer('self', peerId)
    }
  }

  return { peerId, keychain }
}

function createPeerId ({ privateKey, bits, print }) {
  if (privateKey) {
    log('using user-supplied private-key')
    return typeof privateKey === 'object'
      ? privateKey
      : PeerId.createFromPrivKey(Buffer.from(privateKey, 'base64'))
  } else {
    // Generate peer identity keypair + transform to desired format + add to config.
    print('generating %s-bit RSA keypair...', bits)
    return PeerId.create({ bits })
  }
}

function addEmptyDir ({ dag }) {
  const node = new DAGNode(new UnixFs('directory').marshal())
  return dag.put(node, {
    version: 0,
    format: multicodec.DAG_PB,
    hashAlg: multicodec.SHA2_256,
    preload: false
  })
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
    bitswap: {
      stat: notStarted,
      unwant: notStarted,
      wantlist: notStarted
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
    stop: () => apiManager.api,
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

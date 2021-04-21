'use strict'

const { mergeOptions } = require('../utils')
const { isTest } = require('ipfs-utils/src/env')
const log = require('debug')('ipfs')
const errCode = require('err-code')
const { DAGNode } = require('ipld-dag-pb')
const { UnixFS } = require('ipfs-unixfs')
const initAssets = require('../runtime/init-assets-nodejs')
const { AlreadyInitializedError } = require('../errors')
const uint8ArrayFromString = require('uint8arrays/from-string')

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
const BlockService = require('ipfs-block-service')
const createIPLD = require('./ipld')
const Storage = require('./storage')
const Network = require('./network')
const Service = require('../utils/service')
const SwarmAPI = require('./swarm')
const createGCLockAPI = require('./gc-lock')
const createPingAPI = require('./ping')
const createDHTAPI = require('./dht')
const createPubSubAPI = require('./pubsub')

/**
 * @typedef {import('../types').Options} Options
 * @typedef {import('../types').Print} Print
 * @typedef {import('./storage')} StorageAPI
 */

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

    const blockService = new BlockService(storage.repo)
    const ipld = createIPLD({ blockService, options: options.ipld })

    const gcLock = createGCLockAPI({
      path: repo.path,
      repoOwner: options.repoOwner
    })
    const dns = createDNSAPI()
    const isOnline = createIsOnlineAPI({ network })
    // @ts-ignore This type check fails as options.
    // libp2p can be a function, while IPNS router config expects libp2p config
    const ipns = new IPNSAPI(options)

    const name = new NameAPI({
      dns,
      ipns,
      ipld,
      peerId,
      isOnline,
      keychain,
      options
    })
    const resolve = createResolveAPI({ ipld, name })
    const pinManager = new PinManagerAPI({ repo, ipld })
    const pin = new PinAPI({ gcLock, pinManager, ipld })
    const block = new BlockAPI({ blockService, preload, gcLock, pinManager, pin })
    const dag = new DagAPI({ ipld, preload, gcLock, pin })
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
    this.object = new ObjectAPI({ ipld, preload, gcLock })
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

    // unimplemented methods
    const notImplemented = () => Promise.reject(errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED'))
    const notImplementedIter = async function * () { throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED') } // eslint-disable-line require-yield
    this.commands = notImplemented
    this.diag = {
      cmds: notImplemented,
      net: notImplemented,
      sys: notImplemented
    }
    this.log = {
      level: notImplemented,
      ls: notImplemented,
      tail: notImplementedIter
    }
    this.mount = notImplemented
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
    const initOptions = options.init || {}

    // eslint-disable-next-line no-console
    const print = options.silent ? log : console.log
    const storage = await Storage.start(print, options)
    const config = await storage.repo.config.getAll()

    const ipfs = new IPFS({
      storage,
      print,
      options: { ...options, config }
    })

    await ipfs.preload.start()

    ipfs.ipns.startOffline(storage)

    if (storage.isNew && !initOptions.emptyRepo) {
      // add empty unixfs dir object (go-ipfs assumes this exists)
      const cid = await addEmptyDir(ipfs)

      log('adding default assets')
      await initAssets({ addAll: ipfs.addAll, print })

      log('initializing IPNS keyspace')
      await ipfs.ipns.initializeKeyspace(storage.peerId.privKey, uint8ArrayFromString(`/ipfs/${cid}`))
    }

    if (options.start !== false) {
      await ipfs.start()
    }

    return ipfs
  }
}

module.exports = IPFS

/**
 * @param {IPFS} ipfs
 */
const addEmptyDir = async (ipfs) => {
  const node = new DAGNode(new UnixFS({ type: 'directory' }).marshal())
  const cid = await ipfs.dag.put(node, {
    version: 0,
    format: 'dag-pb',
    hashAlg: 'sha2-256',
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

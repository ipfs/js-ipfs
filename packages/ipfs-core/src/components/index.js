'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const { isTest } = require('ipfs-utils/src/env')
const log = require('debug')('ipfs')
const errCode = require('err-code')
const { UnixFS } = require('ipfs-unixfs')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const { identity } = require('multiformats/hashes/identity')
const { bases, hashes, codecs } = require('multiformats/basics')

const initAssets = require('../runtime/init-assets-nodejs')
const { AlreadyInitializedError } = require('../errors')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

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
const createPreloadAPI = require('../preload')
const createMfsPreloadAPI = require('../mfs-preload')
const createFilesAPI = require('./files')
const KeyAPI = require('./key')
const ObjectAPI = require('./object')
const RepoAPI = require('./repo')
const StatsAPI = require('./stats')
const Storage = require('./storage')
const Network = require('./network')
const Service = require('../utils/service')
const SwarmAPI = require('./swarm')
const createPingAPI = require('./ping')
const createDHTAPI = require('./dht')
const createPubSubAPI = require('./pubsub')
const Multicodecs = require('ipfs-core-utils/src/multicodecs')
const Multihashes = require('ipfs-core-utils/src/multihashes')
const Multibases = require('ipfs-core-utils/src/multibases')

/**
 * @typedef {import('../types').Options} Options
 * @typedef {import('../types').Print} Print
 * @typedef {import('./storage')} StorageAPI
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 */

class IPFS {
  /**
   * @param {Object} config
   * @param {Print} config.print
   * @param {StorageAPI} config.storage
   * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
   * @param {Options} config.options
   */
  constructor ({ print, storage, codecs, options }) {
    const { peerId, repo, keychain } = storage
    const network = Service.create(Network)

    const preload = createPreloadAPI(options.preload)

    const dns = createDNSAPI()
    const isOnline = createIsOnlineAPI({ network })
    // @ts-ignore This type check fails as options.
    // libp2p can be a function, while IPNS router config expects libp2p config
    const ipns = new IPNSAPI(options)

    /** @type {MultihashHasher[]} */
    const multihashHashers = Object.values(hashes);

    (options.ipld && options.ipld.hashers ? options.ipld.hashers : []).forEach(hasher => multihashHashers.push(hasher))

    this.hashers = new Multihashes({
      hashers: multihashHashers,
      loadHasher: options.ipld && options.ipld.loadHasher
    })

    /** @type {MultibaseCodec[]} */
    const multibaseCodecs = Object.values(bases);

    (options.ipld && options.ipld.bases ? options.ipld.bases : []).forEach(base => multibaseCodecs.push(base))

    this.bases = new Multibases({
      bases: multibaseCodecs,
      loadBase: options.ipld && options.ipld.loadBase
    })

    const pin = new PinAPI({ repo, codecs })
    const block = new BlockAPI({ codecs, hashers: this.hashers, preload, repo })

    const name = new NameAPI({
      dns,
      ipns,
      repo,
      codecs,
      peerId,
      isOnline,
      keychain,
      options
    })

    const resolve = createResolveAPI({ repo, codecs, bases: this.bases, name })

    const dag = new DagAPI({ repo, codecs, hashers: this.hashers, preload })
    const refs = Object.assign(createRefsAPI({ repo, codecs, resolve, preload }), {
      local: createRefsLocalAPI({ repo: storage.repo })
    })
    const { add, addAll, cat, get, ls } = new RootAPI({
      preload,
      repo,
      options: options.EXPERIMENTAL
    })

    const files = createFilesAPI({
      repo,
      preload,
      hashers: this.hashers,
      options
    })

    const mfsPreload = createMfsPreloadAPI({
      files,
      preload,
      options: options.preload
    })

    this.preload = preload
    this.name = name
    this.ipns = ipns
    this.pin = pin
    this.resolve = resolve
    this.block = block
    this.refs = refs

    this.start = createStartAPI({
      network,
      peerId,
      repo,
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
    this.object = new ObjectAPI({ preload, codecs, repo })
    this.repo = new RepoAPI({ repo, hashers: this.hashers })
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

    this.codecs = codecs
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

    /**
     * @type {BlockCodec}
     */
    const id = {
      name: identity.name,
      code: identity.code,
      encode: (id) => id,
      decode: (id) => id
    }

    /** @type {BlockCodec[]} */
    const blockCodecs = Object.values(codecs);

    [dagPb, dagCbor, id].concat((options.ipld && options.ipld.codecs) || []).forEach(codec => blockCodecs.push(codec))

    const multicodecs = new Multicodecs({
      codecs: blockCodecs,
      loadCodec: options.ipld && options.ipld.loadCodec
    })

    // eslint-disable-next-line no-console
    const print = options.silent ? log : console.log
    const storage = await Storage.start(print, multicodecs, options)
    const config = await storage.repo.config.getAll()

    const ipfs = new IPFS({
      storage,
      print,
      codecs: multicodecs,
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
  const buf = dagPb.encode({
    Data: new UnixFS({ type: 'directory' }).marshal(),
    Links: []
  })

  const cid = await ipfs.block.put(buf, {
    mhtype: 'sha2-256',
    format: 'dag-pb'
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

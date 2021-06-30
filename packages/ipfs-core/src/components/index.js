'use strict'

const { mergeOptions } = require('../utils')
const { isTest } = require('ipfs-utils/src/env')
const log = require('debug')('ipfs')
const errCode = require('err-code')
const { UnixFS } = require('ipfs-unixfs')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const raw = require('multiformats/codecs/raw')
const json = require('multiformats/codecs/json')
const { sha256, sha512 } = require('multiformats/hashes/sha2')
const { identity } = require('multiformats/hashes/identity')
const { base16 } = require('multiformats/bases/base16')
const { base32, base32pad, base32hex, base32hexpad, base32z } = require('multiformats/bases/base32')
const { base58btc, base58flickr } = require('multiformats/bases/base58')
const { base64, base64pad, base64url, base64urlpad } = require('multiformats/bases/base64')

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
const NetworkedBlockStorage = require('../block-storage')

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
   * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
   * @param {Options} config.options
   */
  constructor ({ print, storage, codecs, options }) {
    const { peerId, repo, keychain } = storage
    const network = Service.create(Network)

    const blockstore = new NetworkedBlockStorage(repo.blocks)
    repo.blocks = blockstore

    const preload = createPreloadAPI(options.preload)

    const dns = createDNSAPI()
    const isOnline = createIsOnlineAPI({ network })
    // @ts-ignore This type check fails as options.
    // libp2p can be a function, while IPNS router config expects libp2p config
    const ipns = new IPNSAPI(options)

    const hashers = new Multihashes({
      hashers: (options.ipld && options.ipld.hashers ? options.ipld.hashers : []).concat([sha256, sha512, identity]),
      loadHasher: options.ipld && options.ipld.loadHasher ? options.ipld.loadHasher : (codeOrName) => Promise.reject(new Error(`No hasher found for "${codeOrName}"`))
    })

    const bases = new Multibases({
      bases: [base16, base32, base32pad, base32hex, base32hexpad, base32z, base58btc, base58flickr, base64, base64pad, base64url, base64urlpad].concat(options.ipld && options.ipld.bases ? options.ipld.bases : []),
      loadBase: options.ipld && options.ipld.loadBase ? options.ipld.loadBase : (prefixOrName) => Promise.reject(new Error(`No base found for "${prefixOrName}"`))
    })

    const pin = new PinAPI({ repo, codecs })
    const block = new BlockAPI({ codecs, hashers, preload, repo })

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

    const resolve = createResolveAPI({ repo, codecs, bases, name })

    const dag = new DagAPI({ repo, codecs, hashers, preload })
    const refs = Object.assign(createRefsAPI({ repo, resolve, preload }), {
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
      blockstore,
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
      blockstore,
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
    this.repo = new RepoAPI({ repo })
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

    this.bases = bases
    this.codecs = codecs
    this.hashers = hashers
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

    const codecs = new Multicodecs({
      codecs: [dagPb, dagCbor, raw, json].concat(options.ipld?.codecs || []),
      loadCodec: options.ipld && options.ipld.loadCodec ? options.ipld.loadCodec : (codeOrName) => Promise.reject(new Error(`No codec found for "${codeOrName}"`))
    })

    // eslint-disable-next-line no-console
    const print = options.silent ? log : console.log
    const storage = await Storage.start(print, codecs, options)
    const config = await storage.repo.config.getAll()

    const ipfs = new IPFS({
      storage,
      print,
      codecs,
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

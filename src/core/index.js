'use strict'

const BlockService = require('ipfs-block-service')
const Ipld = require('ipld')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const multiaddr = require('multiaddr')
const multihash = require('multihashes')
const PeerBook = require('peer-book')
const multibase = require('multibase')
const CID = require('cids')
const debug = require('debug')
const extend = require('deep-extend')
const EventEmitter = require('events')

const config = require('./config')
const boot = require('./boot')
const components = require('./components')
const IPNS = require('./ipns')
// replaced by repo-browser when running in the browser
const defaultRepo = require('./runtime/repo-nodejs')
const preload = require('./preload')
const mfsPreload = require('./mfs-preload')

// All known (non-default) IPLD formats
const IpldFormats = {
  get 'bitcoin-block' () {
    return require('ipld-bitcoin')
  },
  get 'eth-account-snapshot' () {
    return require('ipld-ethereum').ethAccountSnapshot
  },
  get 'eth-block' () {
    return require('ipld-ethereum').ethBlock
  },
  get 'eth-block-list' () {
    return require('ipld-ethereum').ethBlockList
  },
  get 'eth-state-trie' () {
    return require('ipld-ethereum').ethStateTrie
  },
  get 'eth-storage-trie' () {
    return require('ipld-ethereum').ethStorageTrie
  },
  get 'eth-tx' () {
    return require('ipld-ethereum').ethTx
  },
  get 'eth-tx-trie' () {
    return require('ipld-ethereum').ethTxTrie
  },
  get 'git-raw' () {
    return require('ipld-git')
  },
  get 'zcash-block' () {
    return require('ipld-zcash')
  }
}

class IPFS extends EventEmitter {
  constructor (options) {
    super()

    this._options = {
      init: true,
      start: true,
      EXPERIMENTAL: {},
      preload: {
        enabled: true,
        addresses: [
          '/dnsaddr/node0.preload.ipfs.io/https',
          '/dnsaddr/node1.preload.ipfs.io/https'
        ]
      }
    }

    options = config.validate(options || {})

    extend(this._options, options)

    if (options.init === false) {
      this._options.init = false
    }

    if (!(options.start === false)) {
      this._options.start = true
    }

    if (typeof options.repo === 'string' ||
        options.repo === undefined) {
      this._repo = defaultRepo(options.repo)
    } else {
      this._repo = options.repo
    }

    // IPFS utils
    this.log = debug('jsipfs')
    this.log.err = debug('jsipfs:err')

    // IPFS types
    this.types = {
      Buffer: Buffer,
      PeerId: PeerId,
      PeerInfo: PeerInfo,
      multiaddr: multiaddr,
      multibase: multibase,
      multihash: multihash,
      CID: CID
    }

    // IPFS Core Internals
    // this._repo - assigned above
    this._peerInfoBook = new PeerBook()
    this._peerInfo = undefined
    this._libp2pNode = undefined
    this._bitswap = undefined
    this._blockService = new BlockService(this._repo)
    this._ipld = new Ipld({
      blockService: this._blockService,
      loadFormat: (codec, callback) => {
        this.log('Loading IPLD format', codec)
        if (IpldFormats[codec]) return callback(null, IpldFormats[codec])
        callback(new Error(`Missing IPLD format "${codec}"`))
      }
    })
    this._preload = preload(this)
    this._mfsPreload = mfsPreload(this)
    this._ipns = new IPNS(null, this)

    // IPFS Core exposed components
    //   - for booting up a node
    this.init = components.init(this)
    this.preStart = components.preStart(this)
    this.start = components.start(this)
    this.stop = components.stop(this)
    this.shutdown = this.stop
    this.isOnline = components.isOnline(this)
    //   - interface-ipfs-core defined API
    this.version = components.version(this)
    this.id = components.id(this)
    this.repo = components.repo(this)
    this.bootstrap = components.bootstrap(this)
    this.config = components.config(this)
    this.block = components.block(this)
    this.object = components.object(this)
    this.dag = components.dag(this)
    this.libp2p = components.libp2p(this)
    this.swarm = components.swarm(this)
    this.files = components.files(this)
    this.name = components.name(this)
    this.bitswap = components.bitswap(this)
    this.pin = components.pin(this)
    this.ping = components.ping(this)
    this.pingPullStream = components.pingPullStream(this)
    this.pingReadableStream = components.pingReadableStream(this)
    this.pubsub = components.pubsub(this)
    this.dht = components.dht(this)
    this.dns = components.dns(this)
    this.key = components.key(this)
    this.stats = components.stats(this)
    this.resolve = components.resolve(this)

    if (this._options.EXPERIMENTAL.pubsub) {
      this.log('EXPERIMENTAL pubsub is enabled')
    }
    if (this._options.EXPERIMENTAL.sharding) {
      this.log('EXPERIMENTAL sharding is enabled')
    }
    if (this._options.EXPERIMENTAL.dht) {
      this.log('EXPERIMENTAL Kademlia DHT is enabled')
    }

    this.state = require('./state')(this)

    // ipfs.ls
    this.ls = this.files.lsImmutable
    this.lsReadableStream = this.files.lsReadableStreamImmutable
    this.lsPullStream = this.files.lsPullStreamImmutable

    // ipfs.util
    this.util = {
      crypto: crypto,
      isIPFS: isIPFS
    }

    // ipfs.files
    const mfs = components.mfs({
      ipld: this._ipld,
      repo: this._repo,
      repoOwner: (this._options.mfs && this._options.mfs.repoOwner) || true
    })

    Object.keys(mfs).forEach(key => {
      this.files[key] = mfs[key]
    })

    boot(this)
  }
}

exports = module.exports = IPFS

exports.createNode = (options) => {
  return new IPFS(options)
}

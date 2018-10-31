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

// All known IPLD formats
const ipldBitcoin = require('ipld-bitcoin')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldDagPb = require('ipld-dag-pb')
const ipldEthAccountSnapshot = require('ipld-ethereum').ethAccountSnapshot
const ipldEthBlock = require('ipld-ethereum').ethBlock
const ipldEthBlockList = require('ipld-ethereum').ethBlockList
const ipldEthStateTrie = require('ipld-ethereum').ethStateTrie
const ipldEthStorageTrie = require('ipld-ethereum').ethStorageTrie
const ipldEthTrie = require('ipld-ethereum').ethTxTrie
const ipldEthTx = require('ipld-ethereum').ethTx
const ipldGit = require('ipld-git')
const ipldRaw = require('ipld-raw')
const ipldZcash = require('ipld-zcash')

const config = require('./config')
const boot = require('./boot')
const components = require('./components')
const IPNS = require('./ipns')
// replaced by repo-browser when running in the browser
const defaultRepo = require('./runtime/repo-nodejs')
const preload = require('./preload')
const mfsPreload = require('./mfs-preload')

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
      formats: [
        ipldBitcoin, ipldDagCbor, ipldDagPb, ipldEthAccountSnapshot,
        ipldEthBlock, ipldEthBlockList, ipldEthStateTrie, ipldEthStorageTrie,
        ipldEthTrie, ipldEthTx, ipldGit, ipldRaw, ipldZcash
      ]
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
    const mfs = components.mfs(this)

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

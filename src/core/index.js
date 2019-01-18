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
const defaultsDeep = require('@nodeutils/defaults-deep')
const EventEmitter = require('events')

const config = require('./config')
const boot = require('./boot')
const components = require('./components')

// replaced by repo-browser when running in the browser
const defaultRepo = require('./runtime/repo-nodejs')
const preload = require('./preload')
const mfsPreload = require('./mfs-preload')
const ipldFormats = require('./runtime/ipld-formats-nodejs')

class IPFS extends EventEmitter {
  constructor (options) {
    super()

    const defaults = {
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

    this._options = defaultsDeep(options, defaults)

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

    const loadIpldFormat = ipldFormats(this)

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
        console.log('Loading IPLD format', codec)
        loadIpldFormat(codec, callback)
      }
    })
    this._preload = preload(this)
    this._mfsPreload = mfsPreload(this)
    this._ipns = undefined
    // eslint-disable-next-line no-console
    this._print = this._options.silent ? this.log : console.log

    // IPFS Core exposed components
    //   - for booting up a node
    this.init = components.init(this)
    this.preStart = components.preStart(this)
    this.start = components.start(this)
    this.stop = components.stop(this)
    this.shutdown = this.stop
    this.isOnline = components.isOnline(this)
    //   - interface-ipfs-core defined API
    Object.assign(this, components.filesRegular(this))
    this.version = components.version(this)
    this.id = components.id(this)
    this.repo = components.repo(this)
    this.bootstrap = components.bootstrap(this)
    this.config = components.config(this)
    this.block = components.block(this)
    this.object = components.object(this)
    this.dag = components.dag(this)
    this.files = components.filesMFS(this)
    this.libp2p = components.libp2p(this)
    this.swarm = components.swarm(this)
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
    if (this._options.EXPERIMENTAL.ipnsPubsub) {
      if (!this._options.EXPERIMENTAL.pubsub) {
        this.log('EXPERIMENTAL pubsub is enabled to use IPNS pubsub')
        this._options.EXPERIMENTAL.pubsub = true
      }

      this.log('EXPERIMENTAL IPNS pubsub is enabled')
    }
    if (this._options.EXPERIMENTAL.sharding) {
      this.log('EXPERIMENTAL sharding is enabled')
    }
    if (this._options.EXPERIMENTAL.dht) {
      this.log('EXPERIMENTAL Kademlia DHT is enabled')
    }

    this.state = require('./state')(this)

    // ipfs.util
    this.util = {
      crypto,
      isIPFS
    }

    boot(this)
  }
}

exports = module.exports = IPFS

exports.createNode = (options) => {
  return new IPFS(options)
}

'use strict'

const BlockService = require('ipfs-block-service')
const IPLDResolver = require('ipld-resolver')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const multihash = require('multihashes')
const PeerBook = require('peer-book')
const CID = require('cids')
const debug = require('debug')
const extend = require('deep-extend')
const EventEmitter = require('events')

const defaultRepo = require('./default-repo')
const boot = require('./boot')
const components = require('./components')

class IPFS extends EventEmitter {
  constructor (options) {
    super()

    this._options = {
      init: true,
      start: true,
      EXPERIMENTAL: {}
    }

    options = options || {}

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

    this.on('error', (err) => this.log(err))

    // IPFS types
    this.types = {
      Buffer: Buffer,
      PeerId: PeerId,
      PeerInfo: PeerInfo,
      multiaddr: multiaddr,
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
    this._ipldResolver = new IPLDResolver(this._blockService)
    this._pubsub = undefined

    // IPFS Core exposed components
    //   - for booting up a node
    this.init = components.init(this)
    this.preStart = components.preStart(this)
    this.start = components.start(this)
    this.stop = components.stop(this)
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
    this.bitswap = components.bitswap(this)
    this.ping = components.ping(this)
    this.pubsub = components.pubsub(this)

    if (this._options.EXPERIMENTAL.pubsub) {
      this.log('EXPERIMENTAL pubsub is enabled')
    }
    this.state = require('./state')(this)

    boot(this)
  }
}

exports = module.exports = IPFS

exports.createNode = (options) => {
  return new IPFS(options)
}

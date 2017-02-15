'use strict'

const BlockService = require('ipfs-block-service')
const IPLDResolver = require('ipld-resolver')
const PeerBook = require('peer-book')
const debug = require('debug')

const defaultRepo = require('./default-repo')

const components = require('./components')

class IPFS {
  constructor (configOpts) {
    let repoInstance
    if (typeof configOpts.repo === 'string' || configOpts.repo === undefined) {
      repoInstance = defaultRepo(configOpts.repo)
    } else {
      repoInstance = configOpts.repo
    }
    delete configOpts.repo

    configOpts.EXPERIMENTAL = configOpts.EXPERIMENTAL || {}

    // IPFS utils
    this.types = {
      Buffer: Buffer
    }
    this.log = debug('jsipfs')
    this.log.err = debug('jsipfs:err')

    // IPFS Core Internals
    this._configOpts = configOpts
    this._repo = repoInstance
    this._peerInfoBook = new PeerBook()
    this._peerInfo = undefined
    this._libp2pNode = undefined
    this._bitswap = undefined
    this._blockService = new BlockService(this._repo)
    this._ipldResolver = new IPLDResolver(this._blockService)
    this._pubsub = undefined

    // IPFS Core exposed components
    //   - for booting up a node
    this.goOnline = components.goOnline(this)
    this.goOffline = components.goOffline(this)
    this.isOnline = components.isOnline(this)
    this.load = components.load(this)
    this.init = components.init(this)
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

    if (configOpts.EXPERIMENTAL.pubsub) {
      this.log('EXPERIMENTAL pubsub is enabled')
    }
  }
}

module.exports = IPFS

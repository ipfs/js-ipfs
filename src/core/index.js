'use strict'

const BlockService = require('ipfs-block-service')
const mDAG = require('ipfs-merkle-dag')
const DAGService = mDAG.DAGService
const PeerBook = require('peer-book')

const defaultRepo = require('./default-repo')

const goOnline = require('./components/go-online')
const goOffline = require('./components/go-offline')
const isOnline = require('./components/is-online')
const load = require('./components/load')
const version = require('./components/version')
const id = require('./components/id')
const repo = require('./components/repo')
const init = require('./components/init')
const bootstrap = require('./components/bootstrap')
const config = require('./components/config')
const block = require('./components/block')
const object = require('./components/object')
const libp2p = require('./components/libp2p')
const swarm = require('./components/swarm')
const ping = require('./components/ping')
const files = require('./components/files')
const bitswap = require('./components/bitswap')

exports = module.exports = IPFS

function IPFS (repoInstance) {
  if (!(this instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  if (typeof repoInstance === 'string' ||
      repoInstance === undefined) {
    repoInstance = defaultRepo(repoInstance)
  }

  // IPFS Core Internals
  this._repo = repoInstance
  this._peerInfoBook = new PeerBook()
  this._peerInfo = null
  this._libp2pNode = null
  this._bitswap = null
  this._blockService = new BlockService(this._repo)
  this._dagService = new DAGService(this._blockService)

  // IPFS Core exposed components

  //   for booting up a node
  this.goOnline = goOnline(this)
  this.goOffline = goOffline(this)
  this.isOnline = isOnline(this)
  this.load = load(this)
  this.init = init(this)

  //   interface-ipfs-core defined API
  this.version = version(this)
  this.id = id(this)
  this.repo = repo(this)
  this.bootstrap = bootstrap(this)
  this.config = config(this)
  this.block = block(this)
  this.object = object(this)
  this.libp2p = libp2p(this)
  this.swarm = swarm(this)
  this.files = files(this)
  this.bitswap = bitswap(this)
  this.ping = ping(this)
}

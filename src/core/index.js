'use strict'

const BlockService = require('ipfs-block-service')
const mDAG = require('ipfs-merkle-dag')
const DAGService = mDAG.DAGService
const PeerBook = require('peer-book')

const defaultRepo = require('./default-repo')

const goOnline = require('./ipfs/go-online')
const goOffline = require('./ipfs/go-offline')
const isOnline = require('./ipfs/is-online')
const load = require('./ipfs/load')
const version = require('./ipfs/version')
const id = require('./ipfs/id')
const repo = require('./ipfs/repo')
const init = require('./ipfs/init')
const bootstrap = require('./ipfs/bootstrap')
const config = require('./ipfs/config')
const block = require('./ipfs/block')
const object = require('./ipfs/object')
const libp2p = require('./ipfs/libp2p')
const files = require('./ipfs/files')
const bitswap = require('./ipfs/bitswap')

exports = module.exports = IPFS

function IPFS (repoInstance) {
  if (!(this instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  if (typeof repoInstance === 'string' ||
      repoInstance === undefined) {
    repoInstance = defaultRepo(repoInstance)
  }

  this._repo = repoInstance
  this._peerInfoBook = new PeerBook()
  this._peerInfo = null
  this._libp2pNode = null
  this._bitswap = null
  this._blockS = new BlockService(this._repo)
  this._dagS = new DAGService(this._blockS)

  this.goOnline = goOnline(this)
  this.goOffline = goOffline(this)
  this.isOnline = isOnline(this)
  this.load = load(this)
  this.version = version(this)
  this.id = id(this)
  this.repo = repo(this)
  this.init = init(this)
  this.bootstrap = bootstrap(this)
  this.config = config(this)
  this.block = block(this)
  this.object = object(this)
  this.libp2p = libp2p(this)
  this.files = files(this)
  this.cat = files(this).cat // Alias for js-ipfs-api cat
  this.bitswap = bitswap(this)
}

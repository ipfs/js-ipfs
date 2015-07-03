var Peer = require('../ipfs-peer')
var PeerBook = require('../ipfs-peer-book')
// var ipfsStream = require('msgproto')
var Storage = require('../ipfs-storage')
var BlockService = require('../ipfs-blocks')
var PathResolver = require('../ipfs-path-resolver')

module.exports = IPFSCore


// this is the IPFS Core module.
// It is a hyper-simple hub of activity.
// It connects the various subsystems together.
function IPFSCore(config) {
  if (!(this instanceof IPFSCore))
    return new IPFSCore(config)

  // default to randomized port
  // if (peer.addresses.length == 0) {
  //   peer.addresses.push('udp4://0.0.0.0:' + randomPort())
  // }
  // console.log('initializing ')

  if (!(config.identity instanceof Peer))
    throw new Error('config.identity required, must be instance of Peer')

  // the local block database (kv store)
  this.storage = Storage(config.storage || {})

  // the local node's identity (a Peer instance)
  // this.identity = config.identity

  // the book of other nodes (a hashtable of Peer instances)
  this.peerbook = PeerBook(config.peerbook)

  // the network message stream
  // this.network = ipfsStream(this.identity)

  // the routing system. recommend ipfs-dht
  // this.routing = DHT(config.routing)

  // the block exchange + strategy. recommend ipfs-bitswap
  // this.bitswap = BitSwap(config.bitswap)

  // the block service, get/add blocks.
  this.blocks = BlockService(this.storage)

  // the path resolution system
  this.resolver = PathResolver(this.blocks)

  // the name system, resolves paths to hashes
  // this.namesys = NameSystem(config.namesys)
}

function randomPort() {
  return Math.floor(Math.random() * (50000 - 2000 + 1)) + 2000;
}

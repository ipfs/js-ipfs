var Peer = require('../ipfs-peer')
var PeerBook = require('../ipfs-peer-book')
var ipfsStream = require('../ipfs-message-stream')

module.exports = IPFS


// this is the IPFS Core module.
// It is a hyper-simple hub of activity.
// It connects the various subsystems together.
function IPFS(config) {
  if (!(this instanceof IPFS))
    return new IPFS(config)

  if (!(config.identity instanceof Peer))
    throw new Error('config.identity required, must be instance of Peer')

  // the local block database (kv store. recommend ipfs-leveldb)
  // this.storage = Storage(config.storage)

  // the local node's identity (a Peer instance)
  this.identity = config.identity

  // the book of other nodes (a hashtable of Peer instances)
  this.peerbook = PeerBook(config.peerbook)

  // the network message stream
  this.network = ipfsStream(this.identity)

  // the routing system. recommend ipfs-dht
  // this.routing = DHT(config.routing)

  // the block exchange + strategy. recommend ipfs-bitswap
  // this.bitswap = BitSwap(config.bitswap)

  // the name system, resolves paths to hashes
  // this.namesys = NameSystem(config.namesys)
}

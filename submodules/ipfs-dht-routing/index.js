var _ = require('underscore')
var Peer = require('../ipfs-peer')

module.exports = DHTRouting

// DHTRouting interfaces between IPFS Routing module
// and an underlying DHT implementation

function DHTRouting(localPeer, dht) {
  this.peer = localPeer
  this.dht = dht
}

// findPeer looks for a particular peer with given id
// callback returns a Peer
// callback errors: same as DHT.findNode
DHTRouting.prototype.findPeer = function findPeer(id, cb) {
  this.dht.findNode(id, function(err, nodeId, addr) {
    if (err) return cb(err)

    if (nodeId != id) {
      var msg = 'Expected: ' + hex(id) + ' Got: ' + hex(nodeId)
      return cb(new Error('dht returned incorrect id. ' + msg))
    }

    var peer = Peer(id)
    peer.addresses.push(addr)
    return cb(null, peer)
  })
}

// findValuePeers retrieves a number of peers serving this value.
// callback returns [Peer, ...]
// callback errors: same as DHT.getSloppyValues
DHTRouting.prototype.findValuePeers = function findValuePeers(key, num, cb) {
  this.dht.getSloppyValues(key, num, function(err, values) {
    if (err) return cb(err)

    values = _.map(values, decodeValue)
    values = _.map(values, Peer)
    cb(null, values)
  })
}

// provideValue tells the DHT that this node can serve
// a particular value. The DHT implementation should:
// - verify is_multihash(key, value)
// callback returns null
// callback errors: same as DHT.setSloppyValue
DHTRouting.prototype.provideValue = function provideValue(key, value, cb) {
  // ignore value. value our own node key.
  value = {id: this.peer.id, addresses: this.peer.addresses}
  value = encodeValue(value)
  this.provide[key] = value
  this.dht.setSloppyValue(key, value, cb)
}

// utilities

function hex(buf) {
  return buf.toString('hex')
}

// function keyConcat(key, other) {
//   key = new Buffer(key.toString() + other.toString())
//   return multihashing.digest(buf, 'sha1')
// }

// use json as encoding for now.
// later, protobuf with multiaddr
function encodeValue(val) {
  return JSON.stringify(val)
}

function decodeValue(val) {
  return JSON.parse(val)
}

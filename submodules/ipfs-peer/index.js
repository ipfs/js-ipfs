var mh = require('multihashing')
var map = require('lodash.map')
var bufeq = require('buffer-equal')
var multiaddr = require('multiaddr')

module.exports = Peer

function Peer(id, other) {
  if (!(this instanceof Peer))
    return new Peer(id, other)

  if (id instanceof Peer)
    return id

  if (!id)
    throw new Error('peer id is required')

  if (id && id.id && !other) {
    other = id
    id = id.id
  }

  other = other || {}
  this.id = Peer.peerId(id)
  this.pubkey = other.pubkey
  this.addresses = other.addresses || [] // multiaddrs
}

// add address for this peer
Peer.prototype.addAddress = function(addr) {
  if (!addr) throw new Error('requires multiaddr format addr')
  if (typeof(addr) == 'string' || addr instanceof String)
    addr = multiaddr(addr)

  this.addresses.push(addr)
  return addr
}

// return best address for given network
Peer.prototype.networkAddress = function(net) {
  for (var a in this.addresses) {
    var addr = this.addresses[a]
    var idx = addr.protoNames().indexOf(net)
    if (idx >= 0)
      return addr
  }
  return undefined
}

// equality check for peers
Peer.prototype.equals = function(peer) {
  return bufeq(this.id, peer.id)
}

Peer.peerId = function(id) {
  if (!(id instanceof Buffer))
    id = new Buffer(id, 'hex')

  var err = mh.multihash.validate(id)
  if (err)
    throw new Error('peer id must be a valid multihash. ' + err)

  return id
}

Peer.genPeerId = function(seed) {
  var buf = new Buffer(0)
  buf.write(seed)
  buf.write('generate peer id')
  return mh(buf, 'sha2-256')
}

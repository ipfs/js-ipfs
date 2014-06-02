var _ = require('underscore')
var mh = require('multihashes')
var bufeq = require('buffer-equal')

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
  this.addresses = other.addresses || []
}

// return best address for given network
Peer.prototype.networkAddress = function(net) {
  return _.find(this.addresses, function(addr) {
    return Peer.addrProtocol(addr) == net
  })
}

// equality check for peers
Peer.prototype.equals = function(peer) {
  return bufeq(this.id, peer.id)
}


Peer.addrProtocol = function(addr) {
  return addr.split(':')[0];
}

Peer.addrUrlToObject = function(addr) {
  var p0 = addr.split('://')
  var p1 = p0[1].split(':')
  return {
    protocol: p0[0],
    family: /4$/.test(p0[0]) ? 'IPv4' : 'IPv6',
    address: p1[0],
    port: parseInt(p1[1], 10),
  }
}

Peer.addrObjectToUrl = function(addr) {
  return addr.protocol + '://' + addr.address + ':' + addr.port
}

Peer.peerId = function(id) {
  if (!(id instanceof Buffer))
    id = new Buffer(id, 'hex')

  var err = mh.validate(id)
  if (err)
    throw new Error('peer id must be a valid multihash. ' + err)

  return id
}

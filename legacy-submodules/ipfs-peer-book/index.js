var Peer = require('../ipfs-peer')
var multiaddr = require('multiaddr')

module.exports = PeerBook

function PeerBook(peers) {
  if (!(this instanceof PeerBook))
    return new PeerBook(peers)

  this.peers = {}

  for (var p in (peers || []))
    this.add(peers[p])
}

PeerBook.prototype.get = function getPeer (id) {
  return this.peers[Peer.peerId(id)]
}

PeerBook.prototype.getByAddress = function getPeerByAddress(addr) {
  if (typeof(addr) == 'string' || addr instanceof String)
    addr = multiaddr(addr)

  for (var p in this.peers) {
    var peer = this.peers[p]
    for (var a in peer.addresses) {
      var addr2 = peer.addresses[a]
      if (addr2.equals(addr))
        return peer
    }
  }
  return undefined
}

PeerBook.prototype.add = function addPeer (peer) {
  if (!(peer instanceof Peer))
    throw new Error('peer must be a Peer');

  this.peers[peer.id] = peer
  return this
}

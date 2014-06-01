var Peer = require('../ipfs-peer')

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

PeerBook.prototype.add = function addPeer (peer) {
  if (!(peer instanceof Peer))
    throw new Error('peer must be a Peer');

  this.peers[peer.id] = peer
  return this
}

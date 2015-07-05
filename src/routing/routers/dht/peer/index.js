/*
 * Peer represents a peer on the IPFS network
 */

var Id = require('./id.js')

exports = module.exports = Peer

function Peer (peerId, multiaddrs) {
  var self = this

  if (!(self instanceof Peer)) {
    throw new Error('Peer must be called with new')
  }

  if (!(peerId instanceof Id)) {
    throw new Error('Peer must be created with an instance of Id')
  }

  self.id = peerId
  self.multiaddrs = multiaddrs
}

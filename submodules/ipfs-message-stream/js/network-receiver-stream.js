var Pkt = require('../../ipfs-packet')
var Peer = require('../../ipfs-peer')
var through2 = require('through2')

module.exports = function(peer) {
  if (!(peer instanceof Peer))
    throw new Error('peer must be a Peer instance')

  return through2.obj(write)

  function write (packet, enc, next) {
    var net = packet.decodePayload()
    var err = net.validate()
    if (err) {
      this.emit('error', {packet: net, error: err})

    } else if (!peer.equals(net.destination)) {
      this.emit('forward', net)

    } else {
      this.push(net)
    }

    next()
  }
}

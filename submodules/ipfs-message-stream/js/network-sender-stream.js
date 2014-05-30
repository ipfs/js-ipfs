var Pkt = require('../../ipfs-packet')
var Peer = require('../../ipfs-peer')
var through2 = require('through2')

module.exports = function(peer) {
  if (!(peer instanceof Peer))
    throw new Error('peer must be a Peer instance')

  return through2.obj(write)

  function write (packet, enc, next) {

    if (!packet.to || !packet.payload) {
      var err = new Error('invalid network pkt')
      this.emit('error', {packet: packet, error: err})
      return
    }

    var net = Pkt.NetworkFrame(peer, packet.to, packet.payload)
    this.push(Pkt.PacketFrame(net))
    next()
  }
}

var through2 = require('through2')
var transDuplex = require('duplex-transform')
var Pkt = require('../../ipfs-packet')
var Peer = require('../../ipfs-peer')

var NS = module.exports = NetworkStream
NS.SenderStream = SenderStream
NS.ReceiverStream = ReceiverStream

// network-duplex stream "wraps" a duplex packet stream
// with sender + receiver transform streams (pipe)
function NetworkStream(peer, stream) {
  return transDuplex(SenderStream(peer), stream, ReceiverStream(peer))
}

function SenderStream(peer) {
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
    this.push(Pkt.PayloadFrame(net))
    next()
  }
}

function ReceiverStream(peer) {
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

var dgram = require('dgram')
var duplexer = require('duplexer')
var packetStream = require('../js/packet-stream')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')

var util = module.exports = {}

util.setupPeer = function(id, addr) {
  var peer = Peer(id)
  peer.addresses.push(addr)

  var stream = packetStream(dgram.createSocket('udp4'), peer)
  stream.dgrams.bind(Peer.addrUrlToObject(addr).port)

  return {
    peer: peer,
    stream: stream,
  }
}

util.shortPeerId = function(peer) {
  return peer.id.toString('hex').substr(0, 6)
}

util.pktToString = function pktToString(ipfsPacket, s) {
  var s = ''
  if (!(ipfsPacket instanceof Pkt.PayloadFrame))
    s += ' / ' + ipfsPacket.toString();
  if (ipfsPacket.decodePayload)
    s += pktToString(ipfsPacket.decodePayload());
  return s;
}

util.duplexWrap = function(writable, stream, readable) {
  writable.pipe(stream)

  stream.on('data', function (data) {
    readable.write(data)
  })

  return duplexer(writable, readable)
}

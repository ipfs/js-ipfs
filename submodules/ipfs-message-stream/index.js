var Pkt = require('../ipfs-packet')
var Peer = require('../ipfs-peer')
var through2 = require('through2')
var packetStream = require('./js/packet-stream')
var networkStream = require('./js/network-stream')
var integrityStream = require('./js/integrity-stream')

module.exports = ipfsStream;

function ipfsStream(peer) {
  // dgram based packet stream
  var addr = peer.networkAddress('udp4')
  var port = Peer.addrUrlToObject(addr).port
  var packetS = packetStream('udp4', peer)
  packetS.dgrams.bind(port)

  // wrap with integrity stream
  var integrityS = integrityStream('sha1', packetS)

  // wrap with network stream
  var networkS = networkStream(peer, integrityS)

  // send out last stream
  var stream = networkS
  stream.peer = peer
  stream.send = ipfsStream.send
  return stream
}

// nice-looking helper for sending packets.
// just calls write({to: peer, payload: pkt})
ipfsStream.send = function ipfsSend(peer, pkt) {
  if (!(pkt instanceof Pkt.Packet))
    throw new Error('pkt must be instance of Packet')

  // wrap in payload if don't have it
  if (!(pkt instanceof Pkt.PayloadFrame))
    pkt = Pkt.PayloadFrame(pkt)

  this.write({to: peer, payload: pkt})
}

ipfsStream.integrityStream = integrityStream
ipfsStream.networkStream = networkStream
ipfsStream.packetStream = packetStream

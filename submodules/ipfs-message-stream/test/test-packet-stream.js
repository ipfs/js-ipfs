var test = require('tape')
var dgram = require('dgram')
var packetStream = require('../js/packet-stream')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')

function setupPeer(id, addr) {
  var peer = Peer(id)
  peer.addresses.push(addr)

  var stream = packetStream(dgram.createSocket('udp4'), peer)
  stream.dgrams.bind(Peer.addrUrlToObject(addr).port)

  return {
    peer: peer,
    stream: stream,
  }
}

function dataMessage(to, from, data) {
  var p = Pkt.DataMessage(data)
  p = Pkt.NetworkFrame((to.peer || to), (from.peer || from), p)
  p = Pkt.IntegrityFrame(p, 'sha1')
  return p
}

function extractData(p) { // integrity frame
  p = p.decodePayload() // network frame
  p = p.decodePayload() // data message
  return p.payload
}


test('test send', function(t) {
  t.plan(10)

  var sent = {}
  var eve = setupPeer('110a33667000f223ce8b688d', 'udp4://localhost:1234')
  var bob = setupPeer('110a48181acd22b3edaebc8a', 'udp4://localhost:1235')

  bob.stream.on('data', function(ipfsPacket) {
    var s = extractData(ipfsPacket).toString()
    console.log('bob got: ' + s)
    t.ok(sent[s], 'should have message: ' + s)
    delete sent[s]

    if (Object.keys(sent).length == 0) { // done
      eve.stream.write(null)
      bob.stream.write(null)
    }
  })

  for (var i = 0; i < 10; i++) {
    var s = 'hi #' + i
    sent[s] = true
    eve.stream.write(dataMessage(eve, bob, new Buffer(s)))
    console.log('eve sent: ' + s)
  }
})

var test = require('tape')
var dgram = require('dgram')
var PacketStream = require('../js/packet-stream')
var IntegrityStream = require('../js/integrity-stream')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')

function setupPeer(id, addr) {
  var peer = Peer(id)
  peer.addresses.push(addr)

  var rawStream = PacketStream(dgram.createSocket('udp4'), peer)
  rawStream.dgrams.bind(Peer.addrUrlToObject(addr).port)

  var stream = IntegrityStream('sha1', rawStream)

  stream.on('end', function() { console.log('stream end') })
  rawStream.on('end', function() { console.log('rawStream end') })

  return {
    peer: peer,
    stream: stream,
    rawStream: rawStream,
  }
}

function dataMessage(to, from, data) {
  var p = Pkt.DataMessage(data)
  p = Pkt.NetworkFrame((to.peer || to), (from.peer || from), p)
  return p
}

function corrupt(pkt) {
  pkt = Pkt.IntegrityFrame(pkt, 'sha1')
  pkt.checksum = pkt.calculateChecksum()
  pkt.checksum[10] = pkt.checksum[10] + 2
  return pkt
}

function extractData(p) { // network frame
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
      console.log('should end')
      eve.stream.end()
      bob.stream.end()
    }
  })

  for (var i = 0; i < 10; i++) {
    var s = 'hi #' + i
    sent[s] = true
    eve.stream.write(dataMessage(eve, bob, new Buffer(s)))
    console.log('eve sent: ' + s)
  }
})


test('test send bad', function(t) {
  var recv = []
  var eve = setupPeer('110a33667000f223ce8b688d', 'udp4://localhost:1234')
  var bob = setupPeer('110a48181acd22b3edaebc8a', 'udp4://localhost:1235')

  bob.stream.on('data', function(ipfsPacket) {
    var s = extractData(ipfsPacket).toString()
    console.log('bob got: ' + s)
    recv.push(s)
    t.ok(/good/.test(s), 'received good data.')
  })

  bob.stream.incoming.on('invalid', function(err) {
    var s = extractData(err.packet)
    console.log('bob stopped bad pkt: ' + s)
    t.ok(/bad/.test(s), 'stopped bad data.')
  })

  // send 20. 10 good, 10 bad.
  for (var i = 0; i < 20; i++) {
    var s
    if (i % 2 == 0) {
      s = 'good #' + i
      eve.stream.write(dataMessage(eve, bob, new Buffer(s)))
    } else {
      s = 'bad #'  + i
      eve.rawStream.write(corrupt(dataMessage(eve, bob, new Buffer(s))))
    }
    console.log('eve sent: ' + s)
  }

  // wait a bit so things flush. invalid isn't emiting atm.
  setTimeout(function() {
    // saw all good
    t.equal(recv.length, 10, 'ended without seeing any bad')
    t.end()

    eve.stream.end()
    bob.stream.end()
  }, 200)
})

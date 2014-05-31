var util = require('./util')
var Pkt = require('../../ipfs-packet')
var IntegrityStream = require('../js/integrity-stream')

function setupPeer(name, id, addr) {
  var peer = util.setupPeer(id, addr)
  peer.rawStream = peer.stream
  peer.stream = IntegrityStream('sha1', peer.stream)

  peer.stream.on('error', console.log)
  peer.stream.on('data', function(p) {
    console.log(name + ': ' + util.pktToString(p))
  })

  peer.stream.on('invalid', function(p) {
    console.log('caught bad packet: ' + util.pktToString(p))
  })

  return peer
}

var eve = setupPeer('eve', '110a33667000f223ce8b688d', 'udp4://localhost:1234')
var bob = setupPeer('bob', '110a48181acd22b3edaebc8a', 'udp4://localhost:1235')

function dataMessage(to, from, data) {
  var p = Pkt.DataMessage(data)
  p = Pkt.NetworkFrame((to.peer || to), (from.peer || from), p)
  return p
}

function corruptIntegrity(pkt) {
  pkt = Pkt.IntegrityFrame(pkt, 'sha1')
  pkt.checksum = pkt.calculateChecksum()
  console.log(pkt.checksum)
  pkt.checksum[10] = pkt.checksum[10] + 2
  console.log(pkt.checksum)
  console.log(pkt.validateChecksum())
  return Pkt.PayloadFrame(pkt)
}

// ipfs-stream automatically fills in:
// - from eve
// - checksum (default is blake2b)
bob.stream.write(dataMessage(eve, bob, new Buffer('Hello')))
eve.stream.write(dataMessage(bob, eve, new Buffer('Hello World')))
bob.stream.write(dataMessage(eve, bob, new Buffer('Hello Worldddd')))
eve.stream.write(dataMessage(bob, eve, new Buffer('Hey')))
bob.stream.write(dataMessage(eve, bob, new Buffer(':)')))
eve.stream.write(dataMessage(bob, eve, new Buffer('A! :D')))

// send bad packets. these should be caught.
bob.rawStream.write(corruptIntegrity(dataMessage(eve, bob, new Buffer('corrupt A'))))
eve.rawStream.write(corruptIntegrity(dataMessage(bob, eve, new Buffer('corrupt B'))))
bob.rawStream.write(corruptIntegrity(dataMessage(eve, bob, new Buffer('corrupt C'))))
eve.rawStream.write(corruptIntegrity(dataMessage(bob, eve, new Buffer('corrupt D'))))

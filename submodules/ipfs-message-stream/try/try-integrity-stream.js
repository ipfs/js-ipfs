var util = require('./util')
var Pkt = require('../../ipfs-packet')
var isWrap = require('../js/integrity-wrap-stream')
var isUnwrap = require('../js/integrity-unwrap-stream')

var eve = util.setupPeer('110a33667000f223ce8b688d', 'udp4://localhost:1234')
var bob = util.setupPeer('110a48181acd22b3edaebc8a', 'udp4://localhost:1235')

eve.stream = util.duplexWrap(isWrap('sha1'), eve.stream, isUnwrap())
bob.stream = util.duplexWrap(isWrap('sha1'), bob.stream, isUnwrap())

// use the 'data' event for receiving ipfs packets.
bob.stream.on('data', function(ipfsPacket) {
  console.log('bob: ' + util.pktToString(ipfsPacket))
})

eve.stream.on('data', function(ipfsPacket) {
  console.log('eve: ' + util.pktToString(ipfsPacket))
})

// use the 'data' event for receiving ipfs packets.
bob.stream.on('error', console.log)
eve.stream.on('error', console.log)


function dataMessage(to, from, data) {
  var p = Pkt.DataMessage(data)
  p = Pkt.NetworkFrame((to.peer || to), (from.peer || from), p)
  return p
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

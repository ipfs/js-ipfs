var util = require('./util')
var Pkt = require('../../ipfs-packet')
var netStream = require('../js/network-stream')

function setupPeer(id, addr) {
  var p = util.setupPeer(id, addr)
  p.stream = netStream(p.peer, p.stream)

  // use the 'data' event for receiving ipfs packets.
  p.stream.on('data', function(pkt) {
    console.log(util.shortPeerId(p.peer) + ': ' + util.pktToString(pkt))
  })

  p.stream.on('error', console.log)

  return p
}


var eve = setupPeer('110a33667000f223ce8b688d', 'udp4://localhost:1234')
var bob = setupPeer('110a48181acd22b3edaebc8a', 'udp4://localhost:1235')
var alc = setupPeer('110a12643821643812643213', 'udp4://localhost:1236')

function msg(to, data) {
  return { to: (to.peer || to), payload: Pkt.DataMessage(data)}
}

// ipfs-stream automatically fills in:
// - from eve
// - checksum (default is blake2b)
bob.stream.write(msg(eve, new Buffer('Hello')))
eve.stream.write(msg(bob, new Buffer('Hello World')))
bob.stream.write(msg(eve, new Buffer('Hello Worldddd')))
eve.stream.write(msg(bob, new Buffer('Hey')))
bob.stream.write(msg(eve, new Buffer(':)')))
eve.stream.write(msg(bob, new Buffer('A! :D')))
alc.stream.write(msg(eve, new Buffer(':)')))
eve.stream.write(msg(alc, new Buffer('A! :D')))

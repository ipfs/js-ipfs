var util = require('./util')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')
var ipfsStream = require('../.')

function setupPeer(id, addr) {
  var p = {peer: Peer(id)}
  p.peer.addresses.push(addr)
  p.stream = ipfsStream(p.peer)

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
bob.stream.send(eve.peer, Pkt.DataMessage(new Buffer('Hello')))
eve.stream.send(bob.peer, Pkt.DataMessage(new Buffer('Hello World')))
bob.stream.send(eve.peer, Pkt.DataMessage(new Buffer('Hello Worldddd')))
eve.stream.send(bob.peer, Pkt.DataMessage(new Buffer('Hey')))
bob.stream.send(eve.peer, Pkt.DataMessage(new Buffer(':)')))
eve.stream.send(bob.peer, Pkt.DataMessage(new Buffer('A! :D')))
alc.stream.write(msg(eve, new Buffer(':)')))
eve.stream.write(msg(alc, new Buffer('A! :D')))

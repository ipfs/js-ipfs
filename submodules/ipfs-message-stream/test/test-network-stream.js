var test = require('tape')
var dgram = require('dgram')
var PacketStream = require('../js/packet-stream')
var NetworkStream = require('../js/network-stream')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')

function setupPeer(id, addr) {
  var peer = Peer(id)
  peer.addresses.push(addr)

  var rawStream = PacketStream(dgram.createSocket('udp4'), peer)
  rawStream.dgrams.bind(Peer.addrUrlToObject(addr).port)

  var stream = NetworkStream(peer, rawStream)

  stream.on('end', function() { console.log('stream end') })
  rawStream.on('end', function() { console.log('rawStream end') })

  return {
    peer: peer,
    stream: stream,
    rawStream: rawStream,
  }
}

function dataMessage(to, data) {
  return { to: to.peer, payload: Pkt.DataMessage(data) }
}

function extractData(p) { // network packet
  p = p.decodePayload().decodePayload() // data message
  return p.payload
}


test('test send', function(t) {
  t.plan(10)

  var sent = { bob: {}, alc: {}}
  var eve = setupPeer('110a33667000f223ce8b688d', 'udp4://localhost:1234')
  var bob = setupPeer('110a48181acd22b3edaebc8a', 'udp4://localhost:1235')
  var alc = setupPeer('110a33667000f223ce8b6777', 'udp4://localhost:1236')

  function dataHandler(name) {
    return function(ipfsPacket) {
      var s = extractData(ipfsPacket).toString()
      console.log(name + ' got: ' + s)
      t.ok(sent[name][s], 'should have message: ' + s)
      delete sent[name][s]

      if (Object.keys(sent[name]).length == 0) { // done with this one
        delete sent[name]
      }

      if (Object.keys(sent).length == 0) { // done
        console.log('should end')
        eve.rawStream.write(null) // should be just stream.
        bob.rawStream.write(null) // should be just stream
        alc.rawStream.write(null) // should be just stream
      }
    }
  }

  bob.stream.on('data', dataHandler('bob'))
  alc.stream.on('data', dataHandler('alc'))

  for (var i = 0; i < 10; i++) {
    var p
    var s = 'hi #' + i
    if (i % 2 == 0) {
      s = 'bob ' + s
      sent.bob[s] = true
      p = dataMessage(bob, new Buffer(s))
    } else {
      s = 'alc ' + s
      sent.alc[s] = true
      p = dataMessage(alc, new Buffer(s))
    }
    eve.stream.write(p)
    console.log('eve sent: ' + s)
  }
})


test('test send bad', function(t) {
  var recv = {}
  var eve = setupPeer('110a33667000f223ce8b688d', 'udp4://localhost:1234')
  var bob = setupPeer('110a48181acd22b3edaebc8a', 'udp4://localhost:1235')
  var stv = setupPeer('110a48181acd22b3edaebc8b', 'udp4://localhost:1235')
  var alc = setupPeer('110a33667000f223ce8b6777', 'udp4://localhost:1236')

  function dataHandler(name) {
    return function(ipfsPacket) {
      var s = extractData(ipfsPacket).toString()
      console.log(name + ' got: ' + s)
      recv[name] = (recv[name] || [])
      recv[name].push(s)
      t.ok(RegExp(name).test(s), 'received data correctly.')
    }
  }

  bob.stream.on('data', dataHandler('bob'))
  alc.stream.on('data', dataHandler('alc'))

  // send 30. 10 to bob, 10 to alc, 10 to stv. stvs are dropped.
  for (var i = 0; i < 30; i++) {
    var s
    switch (i % 3) {
    case 0:
      s = 'bob #' + i
      p = dataMessage(bob, new Buffer(s))
      break
    case 1:
      s = 'alc #' + i
      p = dataMessage(alc, new Buffer(s))
      break
    case 2:
      s = 'stv #' + i
      p = dataMessage(stv, new Buffer(s))
      break
    }
    eve.stream.write(p)
    console.log('eve sent: ' + s)
  }

  // wait a bit so things flush. invalid isn't emiting atm.
  setTimeout(function() {
    // saw all good
    t.equal(recv.bob.length, 10, 'ended with 10 for bob')
    t.equal(recv.alc.length, 10, 'ended with 10 for alc')
    t.equal(recv.stv, undefined, 'ended without any for stv')
    t.end()

    eve.rawStream.write(null) // should be just stream.
    bob.rawStream.write(null) // should be just stream
    stv.rawStream.write(null) // should be just stream.
    alc.rawStream.write(null) // should be just stream.
  }, 200)
})

var test = require('tape')
var dgram = require('dgram')
var ipfsStream = require('../.')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')

function setupPeer(id, addr) {
  var peer = Peer(id)
  peer.addresses.push(addr)
  var stream = ipfsStream(peer)

  stream.on('end', function() { console.log('stream end') })

  return {
    peer: peer,
    stream: stream,
  }
}

function dataMessage(to, data) {
  return { to: to.peer, payload: Pkt.DataMessage(data) }
}

function extractData(p) { // network packet
  p = p.decodePayload() // data message
  return p.payload
}


test('test write', function(t) {
  t.plan(13)

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
        t.ok(Object.keys(sent[name]).length == 0, name + ' done receiving')
        delete sent[name]
      }

      if (Object.keys(sent).length == 0) { // done
        t.ok(Object.keys(sent).length == 0, 'done receiving')
        console.log('should end')
        eve.stream.end()
        bob.stream.end()
        alc.stream.end()
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

var test = require('tape')
var Peer = require('../ipfs-peer')
var bufeq = require('buffer-equal')
var stream = require('readable-stream')
var ipfsNetwork = require('./')
var ipfsMessage = require('../ipfs-message')



function protoSegment() {
  var a = stream.PassThrough({objectMode: true})
  var b = stream.PassThrough({objectMode: true})
  var side1 = duplexer2({objectMode: true}, a, b)
  var side2 = duplexer2({objectMode: true}, b, a)
  side1.side2 = side2
  return side1
}

function setupNetwork() {
  return ipfsNetwork({}, {
    routing: protoSegment(),
    exchange: protoSegment(),
    identity: protoSegment(),
  })
}


var m = ipfsMessage()
m.source = Peer.genPeerId('alice')
m.destination = Peer.genPeerId('bob')

m.payload[0] = { protocol: 1, data: new Buffer('beep boop') }
m.payload[1] = { protocol: 1, data: new Buffer('poob peeb') }
m.payload[2] = { protocol: 2, data: new Buffer('bpee oopb') }
m.payload[1] = { protocol: 3, data: new Buffer('BEEP BOOP') }

test('net addrs match', function(t) {
  var data = m.encode()
  var m2 = ipfsMessage.decode(data)
  t.ok(bufeq(m.source, m2.source), 'sources match')
  t.ok(bufeq(m.destination, m2.destination), 'destinations match')
  t.end()
})

test('payloads match', function(t) {
  var m2 = ipfsMessage.decode(m.encode())
  for (var i in m.payload)
    t.ok(bufeq(m.payload[i].data, m2.payload[i].data), 'data matches')
  t.end()
})

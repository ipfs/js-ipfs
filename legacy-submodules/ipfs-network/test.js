var test = require('tape')
var Peer = require('../ipfs-peer')
var PeerBook = require('../ipfs-peer-book')
var bufeq = require('buffer-equal')
var stream = require('readable-stream')
var ipfsNetwork = require('./')
var ipfsMessage = require('../ipfs-message')
var duplexer2 = require('duplexer2.jbenet')


function protoSegment() {
  var o = {objectMode: true}
  var a = stream.PassThrough(o)
  var b = stream.PassThrough(o)
  var side1 = duplexer2(o, a, b)
  var side2 = duplexer2(o, b, a)
  side1.side2 = side2
  return side1
}

function setupNetwork(port, peers) {
  var peerbook = PeerBook(peers)
  var net = ipfsNetwork({port: port}, peerbook, {
    routing: protoSegment(),
    exchange: protoSegment(),
    identity: protoSegment(),
  })
  net.wire.errors.pipe(process.stdout)
  net.peerbook = peerbook
  return net
}

function makeMessage(src, dst, payloads) {
  var m = Message()
  m.source = src.id
  m.destination = dst.id
  for (var p in payloads) {
    var pp = payloads[p]
    m.payload[p] = { protocol: pp[0], data: new Buffer(pp[1]) }
  }
  return m
}


test('2 nets talk to each other', function(t) {
  var p1 = Peer('11148843d7f92416211de9ebb963ff41111111111111')
  var p2 = Peer('11148843d7f92416211de9ebb963ff40000000000000')
  p1.addAddress('/ip4/127.0.0.1/udp/1234')
  p2.addAddress('/ip4/127.0.0.1/udp/2345')

  var net1 = setupNetwork(1234, [p2])
  var net2 = setupNetwork(2345, [p1])

  var done = 0
  function donedone() {
    net1.protocols.routing.side2.end()
    net1.protocols.identity.side2.end()
    net1.protocols.exchange.side2.end()
    net2.protocols.routing.side2.end()
    net2.protocols.identity.side2.end()
    net2.protocols.exchange.side2.end()
    t.end()
  }

  net1.protocols.routing.side2.on('data', function(msg) {
    t.ok(Peer(msg.source).equals(p2), 'destination check')
    t.ok(Peer(msg.destination).equals(p1), 'destination check')
    t.equal(msg.protocol, 2, 'protocol check')
    t.equal(msg.data.toString(), 'boop')
    if (++done == 2) donedone()
  })

  net2.protocols.exchange.side2.on('data', function(msg) {
    t.ok(Peer(msg.source).equals(p1), 'destination check')
    t.ok(Peer(msg.destination).equals(p2), 'destination check')
    t.equal(msg.protocol, 3, 'protocol check')
    t.equal(msg.data.toString(), 'beep')
    if (++done == 2) donedone()
  })

  net1.protocols.exchange.side2.write({
    source: p1.id,
    destination: p2.id,
    protocol: 3,
    data: new Buffer('beep')
  })

  net2.protocols.routing.side2.write({
    source: p2.id,
    destination: p1.id,
    protocol: 2,
    data: new Buffer('boop')
  })
})

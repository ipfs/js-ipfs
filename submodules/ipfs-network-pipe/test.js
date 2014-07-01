var test = require('tape')
var Peer = require('../ipfs-peer')
var PeerBook = require('../ipfs-peer-book')
var NetPipe = require('./')
var Message = require('../ipfs-message')


function setupPipe(port, peers) {
  var pb = PeerBook(peers)
  var pipe = NetPipe({port: port}, pb)
  pipe.peerbook = pb
  pipe.errors.pipe(process.stderr)
  return pipe
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


test('1 to 1 topology', function(t) {

  var p1 = Peer('11148843d7f92416211de9ebb963ff41111111111111')
  var p2 = Peer('11148843d7f92416211de9ebb963ff40000000000000')
  p1.addAddress('/ip4/127.0.0.1/udp/1234')
  p2.addAddress('/ip4/127.0.0.1/udp/2345')

  var net1 = setupPipe(1234, [p2])
  var net2 = setupPipe(2345, [p1])

  net1.messages.on('data', console.log)
  net2.messages.on('data', function(m) {
    t.ok(Peer(m.source).equals(p1), 'sent from right person')
    t.equal(m.payload[0].protocol, 1, 'payload check')
    t.equal(m.payload[0].data.toString(), 'beep')
    t.equal(m.payload[1].protocol, 2, 'payload check')
    t.equal(m.payload[1].data.toString(), 'boop')
    t.end()
    net1.messages.end()
    net2.messages.end()
  })

  var m1 = makeMessage(p1, p2, [[1, 'beep'], [2, 'boop']])
  net1.messages.write(m1)
})

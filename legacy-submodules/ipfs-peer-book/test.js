var Peer = require('../ipfs-peer')
var PeerBook = require('./')
var multihashing = require('multihashing')
var multiaddr = require('multiaddr')
var bufeq = require('buffer-equal')
var test = require('tape')

test('simple peer book', function(t) {
  var p1 = Peer('111448181acd22b3edaebc8a447868a7df7ce629920a')
  var p2 = Peer('111433667000f223ce8b688dd4de29962c81bb9afb63')

  var pb = PeerBook()
  pb.add(p1)
  pb.add(p2)

  t.equal(p1, pb.get('111448181acd22b3edaebc8a447868a7df7ce629920a'), 'get peer 1')
  t.equal(p2, pb.get('111433667000f223ce8b688dd4de29962c81bb9afb63'), 'get peer 2')
  t.end()
})

test('addresses', function(t) {
  function setupPeer(addr) {
    var p = Peer(multihashing(addr, 'sha1'))
    p.addresses.push(multiaddr(addr))
    return p
  }

  var a = [
    '/ip4/10.20.30.40/udp/1234',
    '/ip4/40.50.60.70/tcp/5678',
    '/ip4/40.50.60.70/sctp/9012',
    '/ip4/10.20.30.40/udp/2345',
  ]

  var p1 = setupPeer(a[0])
  var p2 = setupPeer(a[1])
  var p3 = setupPeer(a[2])
  p1.addresses.push(multiaddr(a[3]))

  var pb = PeerBook([p1, p2])
  pb.add(p3)

  t.equal(pb.getByAddress(a[0]), p1, 'getByAddress 1')
  t.equal(pb.getByAddress(a[1]), p2, 'getByAddress 2')
  t.equal(pb.getByAddress(a[2]), p3, 'getByAddress 3')
  t.equal(pb.getByAddress(a[3]), p1, 'getByAddress 4')
  t.end()
})

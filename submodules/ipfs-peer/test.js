var Peer = require('./')
var multihashing = require('multihashing')
var multiaddr = require('multiaddr')
var bufeq = require('buffer-equal')
var test = require('tape')

test('simple peer stuff', function(t) {
  var id = multihashing('foobar', 'sha1')
  t.ok(Peer(id), 'constructed')
  t.ok(bufeq(Peer(id).id, id), 'id equals')
  t.ok(Peer(id).equals(Peer(id)), 'peer equals')
  t.end()
})

test('addresses', function(t) {
  var id = multihashing('foobar', 'sha1')
  var p = Peer(id)

  var a1 = multiaddr('/ip4/10.20.30.40/udp/1234')
  var a2 = multiaddr('/ip4/40.50.60.70/tcp/5678')
  var a3 = multiaddr('/ip4/40.50.60.70/sctp/9012')
  p.addresses.push(a1)
  p.addresses.push(a2)
  p.addresses.push(a3)

  t.ok(p.networkAddress('udp') === a1, 'getting addr 1')
  t.ok(p.networkAddress('tcp') === a2, 'getting addr 2')
  t.ok(p.networkAddress('sctp') === a3, 'getting addr 3')
  t.end()
})


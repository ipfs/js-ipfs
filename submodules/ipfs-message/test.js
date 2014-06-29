var test = require('tape')
var Peer = require('../ipfs-peer')
var bufeq = require('buffer-equal')
var ipfsMessage = require('./')


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

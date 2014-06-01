# ipfs-stream -- stream of ipfs packets

This module wraps any stream of messages and validates
them as ipfs messages/packets. It only emits those that
are valid. It will also emit invalid ones, so you can
log them, or whatever.


```js

var ipfsStream = require('ipfs-stream')
var peer = require('ipfs-peer')
var pkt = require('ipfs-packet')

var bob = peer('111448181acd22b3edaebc8a447868a7df7ce629920a')
bob.addresses.push('udp4://10.20.30.40:1234')

var bobS = ipfsStream(bob)
bobS.on('data', function(ipkt) {
  console.log('bob got: ' + ipkt)
})

// use the 'data' event for all ipfs messages.
bobS.on('data', function(ipkt) {
  console.log('got: ' + ipkt)
})

// you can use the 'invalid' event for all non-ipfs messages.
bobS.on('invalid', function(invalidData) {
  console.error('got invalid packet:')
  console.error(invalidData);
})


var eve = peer('111433667000f223ce8b688dd4de29962c81bb9afb63')
eve.addresses.push('udp4://10.20.30.50:1235')

bobS.send(eve, Pkt.DataMessage(new Buffer('hello world :)')))
```

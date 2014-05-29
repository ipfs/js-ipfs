# ipfs-packet -- packets in ipfs

This module includes all the packets, and their encoding/decoding.

See [packets.proto](packets.proto) for a listing of the kinds of packets.

Some packet types are _frames_ (containers), and some are _messages_
(payloads).

## Example: sending a Data Message

```js
var pkt = require('ipfs-packet')
var peer = require('ipfs-peer')

// all the data we'll need
var eve = peer('111433667000f223ce8b688dd4de29962c81bb9afb63') // me
var bob = peer('111448181acd22b3edaebc8a447868a7df7ce629920a') // target
var data = new Buffer('beep boop')


var dataPkt = pkt.Data(data) // payload
var netPkt = pkt.Network(eve, bob, dataPkt) // from, to, payload
var ckPkt = pkt.Integrity(netPkt, 'blake2b') // payload, multihash fn

var buf = ckPkt.encode() // a buffer
// encoding happens recursively, and lazily.
// ckPkt's checksum calculation happens now.

console.log(buf)
```

## Example: receiving a Data Message

```js
var pkt = require('ipfs-packet')

var buf = getPktBuffer()

var pkt1 = pkt(buf)  // decodes
pkt1.type            // integrity
pkt1.checksum        // multihash
pkt1.valid()         // validates checksum
pkt1.payloadBuffer() // payload bytes

var pkt2 = pkt1.decodePayloadPacket() // decode payload as packet
pkt2.type         // network
pkt2.source       // peer(eve)
pkt2.destination  // peer(bob)
pkt2.valid()      // checks that src/dest are proper addresses.

var pkt3 = pkt2.decodePayloadPacket()
pkt3.type  // data

var data = pkt3.data
console.log(data) // beep boop
```

# ipfs-peer -- peer object in ipfs

This module represents a peering entity in ipfs.
It has:

- `id` hash of pubkey
- `pubkey` public key
- `addresses` list of network addresses

All fields are retrievable from the network, given the id.

```
var peer = require('ipfs-peer')
var id = new Buffer('111431ee3269618939b37049251d79e9edd52c67d051', 'hex')
var p = peer(id)
```

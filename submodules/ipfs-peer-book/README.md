# ipfs-peer-book -- collection of ipfs peers

This represents a local collection of peers, and any
associated data (ledgers, etc).

Why is this a module, and not just a js object?
Because peer-books may have to do sophisticated things later on,
like load info lazily, cache only some peers in memory and put
others in disk, etc. This module defines the interface.


## Example

```js
var Peer = require('ipfs-peer')
var PeerBook = require('ipfs-peer-book')

p1 = Peer('111448181acd22b3edaebc8a447868a7df7ce629920a')
p2 = Peer('111433667000f223ce8b688dd4de29962c81bb9afb63')

pb = PeerBook()
pb.add(p1)
pb.add(p2)
pb.get('111448181acd22b3edaebc8a447868a7df7ce629920a') // p1
pb.get('111433667000f223ce8b688dd4de29962c81bb9afb63') // p2
```

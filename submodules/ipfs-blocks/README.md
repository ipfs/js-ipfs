# ipfs-blocks - block service

ipfs-blocks is the subsystem of ipfs that provides or coordinates block retrieval for the other subsystems.


## Interface

```js
var blocks = ipfsBlocks(storage, routing, bitswap)
blocks.get(multihash, callback)
blocks.put(multihash, value, callback)
```

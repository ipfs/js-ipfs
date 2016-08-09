DHT API
=======

#### `findpeer`

> Retrieve the Peer Info of a reachable node in the network.

##### `Go` **WIP**

##### `JavaScript` - ipfs.dht.findpeer(peerId, [callback])

Where `peerId` is a IPFS/libp2p Id of type [PeerId](https://github.com/libp2p/js-peer-id).

`callback` must follow `function (err, peerInfo) {}` signature, where `err` is an error if the operation was not successful. `peerInfo` is an object of type [PeerInfo](https://github.com/libp2p/js-peer-info)

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
var id = PeerId.create()
ipfs.dht.findPeer(id, function (err, peerInfo) {
  // peerInfo will contain the multiaddrs of that peer
})
```

#### `findprovs`

> Retrieve the providers for content that is addressed by an hash.

##### `Go` **WIP**

##### `JavaScript` - ipfs.dht.findprovs(hash, [callback])

Where `hash` is a multihash.

`callback` must follow `function (err, peerInfos) {}` signature, where `err` is an error if the operation was not successful. `peerInfos` is an array of objects of type [PeerInfo](https://github.com/libp2p/js-peer-info)

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.dht.findProvs(hash, function (err, peerInfos) {
  // peerInfo will contain the multiaddrs of that peer
})
```

#### `get`

> 

##### `Go` **WIP**

##### `JavaScript` - ipfs.dht.get(key, [callback])


If no `callback` is passed, a promise is returned.

Example:


#### `put`

> 

##### `Go` **WIP**

##### `JavaScript` - ipfs.dht.put(key, value, [callback])


If no `callback` is passed, a promise is returned.

Example:


#### `query`

> 

##### `Go` **WIP**

##### `JavaScript` - ipfs.dht.query(peerId, [callback])



If no `callback` is passed, a promise is returned.

Example:



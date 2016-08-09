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
ipfs.dht.findProvs(hash, function (err, peerInfos) {})
```

#### `get`

> Retrieve a value from DHT

##### `Go` **WIP**

##### `JavaScript` - ipfs.dht.get(key, [callback])

Where `key` is a string.

`callback` must follow `function (err, value) {}` signature, where `err` is an error if the operation was not successful. `value` is the value that was stored under that key.

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.dht.get(key, function (err, value) {})
```

#### `put`

> Store a value on the DHT

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



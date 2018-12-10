# DHT API

* [dht.findpeer](#dhtfindpeer)
* [dht.findprovs](#dhtfindprovs)
* [dht.get](#dhtget)
* [dht.provide](#dhtprovide)
* [dht.put](#dhtput)
* [dht.query](#dhtquery)

#### `dht.findpeer`

> Retrieve the Peer Info of a reachable node in the network.

##### Go **WIP**

##### JavaScript - `ipfs.dht.findPeer(peerId, [callback])`

Where `peerId` is a IPFS/libp2p Id from [PeerId](https://github.com/libp2p/js-peer-id) type.

`callback` must follow `function (err, peerInfo) {}` signature, where `err` is an error if the operation was not successful. `peerInfo` is an object of type `PeerInfo`.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
var id = PeerId.create()

ipfs.dht.findPeer(id, function (err, peerInfo) {
  // peerInfo will contain the multiaddrs of that peer
  const id = peerInfo.id
  const addrs = peerInfo.multiaddrs
})
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.findprovs`

> Retrieve the providers for content that is addressed by an hash.

##### Go **WIP**

##### JavaScript - `ipfs.dht.findProvs(hash, [options], [callback])`

Where `hash` is a multihash.

`options` an optional object with the following properties
  - `timeout` - a maximum timeout in milliseconds
  - `maxNumProviders` - a maximum number of providers to find

`callback` must follow `function (err, peerInfos) {}` signature, where `err` is an error if the operation was not successful. `peerInfos` is an array of type `[PeerInfo]`. Each entry of this array is composed by the peerId, as well as an array with its adresses.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.dht.findProvs(multihash, function (err, res) {})

ipfs.dht.findProvs(multihash, { timeout: 4000 }, function (err, res) {})
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.get`

> Retrieve a value from DHT

##### Go **WIP**

##### JavaScript - `ipfs.dht.get(key, [callback])`

Where `key` is a string.

`callback` must follow `function (err, value) {}` signature, where `err` is an error if the operation was not successful. `value` is the value that was stored under that key.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.dht.get(key, function (err, value) {})
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.provide`

> Announce to the network that you are providing given values.

##### Go **WIP**

##### JavaScript - `ipfs.dht.provide(cid, [callback])`

Where `cid` is a CID or array of CIDs.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.dht.provide(cid, function (err) {})
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.put`

> Store a value on the DHT

##### Go **WIP**

##### JavaScript - `ipfs.dht.put(key, value, [callback])`

Where `key` is a string and `value` can be of any type.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.dht.put(key, value, function (err) {})
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.query`

> Queries the network for the 'closest peers' to a given key. 'closest' is defined by the rules of the underlying Peer Routing mechanism.

##### Go **WIP**

##### JavaScript - `ipfs.dht.query(peerId, [callback])`

Where `peerId` is a IPFS/libp2p Id of type [PeerId](https://github.com/libp2p/js-peer-id).

`callback` must follow `function (err, peerInfos) {}` signature, where `err` is an error if the operation was not successful. `peerInfos` is an array of objects of type [PeerInfo](https://github.com/libp2p/js-peer-info)

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const id = PeerId.create()

ipfs.dht.query(id, function (err, peerInfos) {
})
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/dht

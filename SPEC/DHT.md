# DHT API

* [dht.findPeer](#dhtfindpeer)
* [dht.findProvs](#dhtfindprovs)
* [dht.get](#dhtget)
* [dht.provide](#dhtprovide)
* [dht.put](#dhtput)
* [dht.query](#dhtquery)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `dht.findPeer`

> Retrieve the Peer Info of a reachable node in the network.

##### `ipfs.dht.findPeer(peerId)`

Where `peerId` is a IPFS/libp2p Id from [PeerId](https://github.com/libp2p/js-peer-id) type.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<PeerInfo>` | An object type [`PeerInfo`](https://github.com/libp2p/js-peer-info) |

**Example:**

```JavaScript
var id = PeerId.create()

const peerInfo = await ipfs.dht.findPeer(id)
// peerInfo will contain the multiaddrs of that peer
const id = peerInfo.id
const addrs = peerInfo.multiaddrs
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.findProvs`

> Retrieve the providers for content that is addressed by an hash.

##### `ipfs.dht.findProvs(hash, [options])`

Where `hash` is a multihash.

`options` an optional object with the following properties
  - `timeout` - a maximum timeout in milliseconds
  - `maxNumProviders` - a maximum number of providers to find

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of type [`PeerInfo`](https://github.com/libp2p/js-peer-info) |

each entry of the returned array is composed by the peerId, as well as an array with its adresses.

**Example:**

```JavaScript
const provs = await ipfs.dht.findProvs(multihash)
provs.forEach(prov => {
  console.log(prov.id.toB58String())
})

const provs2 = await ipfs.dht.findProvs(multihash, { timeout: 4000 })
provs2.forEach(prov => {
  console.log(prov.id.toB58String())
})
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.get`

> Retrieve a value from DHT

##### `ipfs.dht.get(key)`

Where `key` is a Buffer.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Buffer>` | The value that was stored under that key |

**Example:**

```JavaScript
const value = await ipfs.dht.get(key)
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.provide`

> Announce to the network that you are providing given values.

##### `ipfs.dht.provide(cid)`

Where `cid` is a CID or array of CIDs.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.dht.provide(cid)
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.put`

> Store a value on the DHT

##### `ipfs.dht.put(key, value)`

Where `key` is a Buffer and `value` is a Buffer.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.dht.put(key, value)
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.query`

> Queries the network for the 'closest peers' to a given key. 'closest' is defined by the rules of the underlying Peer Routing mechanism.

##### `ipfs.dht.query(peerId)`

Where `peerId` is a IPFS/libp2p Id of type [PeerId](https://github.com/libp2p/js-peer-id).

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects of type [PeerInfo](https://github.com/libp2p/js-peer-info) |

**Example:**

```JavaScript
const id = PeerId.create()

const peerInfos = await ipfs.dht.query(id)

peerInfos.forEach(p => {
  console.log(p.id.toB58String())
})
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/dht

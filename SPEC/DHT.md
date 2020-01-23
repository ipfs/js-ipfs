# DHT API

* [dht.findPeer](#dhtfindpeer)
* [dht.findProvs](#dhtfindprovs)
* [dht.get](#dhtget)
* [dht.provide](#dhtprovide)
* [dht.put](#dhtput)
* [dht.query](#dhtquery)

#### `dht.findPeer`

> Find the multiaddresses associated with a Peer ID

##### `ipfs.dht.findPeer(peerId)`

Where `peerId` is a Peer ID in `String`, [`CID`](https://github.com/multiformats/js-cid) or [`PeerId`](https://github.com/libp2p/js-peer-id) format.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<{ id: CID, addrs: Multiaddr[] }>` | A promise that resolves to an object with `id` and `addrs`. `id` is a [`CID`](https://github.com/multiformats/js-cid) - the peer's ID and `addrs` is an array of [Multiaddr](https://github.com/multiformats/js-multiaddr/) - addresses for the peer. |

**Example:**

```JavaScript
const info = await ipfs.dht.findPeer('QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt')

console.log(info.id.toString())
/*
QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt
*/

info.addrs.forEach(addr => console.log(addr.toString()))
/*
/ip4/147.75.94.115/udp/4001/quic
/ip6/2604:1380:3000:1f00::1/udp/4001/quic
/dnsaddr/bootstrap.libp2p.io
/ip6/2604:1380:3000:1f00::1/tcp/4001
/ip4/147.75.94.115/tcp/4001
*/
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.findProvs`

> Find peers that can provide a specific value, given a CID.

##### `ipfs.dht.findProvs(cid, [options])`

Where `cid` is a CID as a `String`, `Buffer` or [`CID`](https://github.com/multiformats/js-cid) instance.

`options` an optional object with the following properties:
  - `numProviders` - the number of providers to find. Default: 20

Note that if `options.numProviders` are not found an error will be thrown.

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<{ id: CID, addrs: Multiaddr[] }>` | A async iterable that yields objects with `id` and `addrs`. `id` is a [`CID`](https://github.com/multiformats/js-cid) - the peer's ID and `addrs` is an array of [Multiaddr](https://github.com/multiformats/js-multiaddr/) - addresses for the peer. |

**Example:**

```JavaScript
const providers = ipfs.dht.findProvs('QmdPAhQRxrDKqkGPvQzBvjYe3kU8kiEEAd2J6ETEamKAD9')

for await (const provider of providers) {
  console.log(provider.id.toString())
}
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.get`

> Given a key, query the routing system for its best value.

##### `ipfs.dht.get(key)`

Where `key` is a `Buffer`.

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

##### `ipfs.dht.provide(cid, [options])`

Where `cid` is a CID or array of CIDs as a `String`, `Buffer` or [`CID`](https://github.com/multiformats/js-cid) instance.

`options` an optional object with the following properties:
  - `recursive` - boolean, set to `true` to recursively provide the entire graph. Default `false`.

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | DHT query messages. See example below for structure. |

Note: You must consume the iterable to completion to complete the provide operation.

**Example:**

```JavaScript
for await (const message of ipfs.dht.provide('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR')) {
  console.log(message)
}

/*
Prints objects like:

{
  extra: 'dial backoff',
  id: CID(QmWtewmnzJiQevJPSmG9s8aC7yRfK2WXTCdRc1pCbDFu6z),
  responses: [
    {
      addrs: [
        Multiaddr(/ip4/127.0.0.1/tcp/4001),
        Multiaddr(/ip4/172.20.0.3/tcp/4001),
        Multiaddr(/ip4/35.178.190.196/tcp/1024)
      ],
      id: CID(QmRz5Nth4jTFuJJKcjyb6uwvrhxWbruRvamKY2PJxwJKw8)
    }
  ],
  type: 1
}

For message `type` values, see:
https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L15-L24
*/
```

Alternatively you can simply "consume" the iterable:

```js
const { consume } = require('streaming-iterables')
await consume(ipfs.dht.provide('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'))
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.put`

> Write a key/value pair to the routing system.

##### `ipfs.dht.put(key, value)`

Where `key` is a `Buffer` and `value` is a `Buffer`.

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | DHT query messages. See example below for structure. |

**Example:**

```JavaScript
for await (const message of ipfs.dht.put(key, value)) {
  console.log(message)
}

/*
Prints objects like:

{
  extra: 'dial backoff',
  id: CID(QmWtewmnzJiQevJPSmG9s8aC7yRfK2WXTCdRc1pCbDFu6z),
  responses: [
    {
      addrs: [
        Multiaddr(/ip4/127.0.0.1/tcp/4001),
        Multiaddr(/ip4/172.20.0.3/tcp/4001),
        Multiaddr(/ip4/35.178.190.196/tcp/1024)
      ],
      id: CID(QmRz5Nth4jTFuJJKcjyb6uwvrhxWbruRvamKY2PJxwJKw8)
    }
  ],
  type: 1
}

For message `type` values, see:
https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L15-L24
*/
```

Alternatively you can simply "consume" the iterable:

```js
const { consume } = require('streaming-iterables')
await consume(ipfs.dht.put(key, value))
```

A great source of [examples][] can be found in the tests for this API.

#### `dht.query`

> Find the closest Peer IDs to a given Peer ID by querying the DHT.

##### `ipfs.dht.query(peerId)`

Where `peerId` is a Peer ID in `String`, [`CID`](https://github.com/multiformats/js-cid) or [`PeerId`](https://github.com/libp2p/js-peer-id) format.

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | DHT query messages. See example below for structure. |

**Example:**

```JavaScript
for await (const info of ipfs.dht.query('QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt')) {
  console.log(info)
}

/*
Prints objects like:

{
  extra: 'dial backoff',
  id: CID(QmWtewmnzJiQevJPSmG9s8aC7yRfK2WXTCdRc1pCbDFu6z),
  responses: [
    {
      addrs: [
        Multiaddr(/ip4/127.0.0.1/tcp/4001),
        Multiaddr(/ip4/172.20.0.3/tcp/4001),
        Multiaddr(/ip4/35.178.190.196/tcp/1024)
      ],
      id: CID(QmRz5Nth4jTFuJJKcjyb6uwvrhxWbruRvamKY2PJxwJKw8)
    }
  ],
  type: 1
}

For message `type` values, see:
https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L15-L24
*/
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/dht

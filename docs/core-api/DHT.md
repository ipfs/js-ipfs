# DHT API <!-- omit in toc -->

- [`ipfs.dht.findPeer(peerId, [options])`](#ipfsdhtfindpeerpeerid-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.dht.findProvs(cid, [options])`](#ipfsdhtfindprovscid-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.dht.get(key, [options])`](#ipfsdhtgetkey-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.dht.provide(cid, [options])`](#ipfsdhtprovidecid-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.dht.put(key, value, [options])`](#ipfsdhtputkey-value-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)
- [`ipfs.dht.query(peerId, [options])`](#ipfsdhtquerypeerid-options)
  - [Parameters](#parameters-5)
  - [Options](#options-5)
  - [Returns](#returns-5)
  - [Example](#example-5)

## `ipfs.dht.findPeer(peerId, [options])`

> Find the multiaddresses associated with a Peer ID

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| peerId | [PeerID][] or [CID][] | The Peer ID of the node to find |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<{ id: String, addrs: Multiaddr[] }>` | A promise that resolves to an object with `id` and `addrs`. `id` is a String - the peer's ID and `addrs` is an array of [Multiaddr](https://github.com/multiformats/js-multiaddr/) - addresses for the peer. |

### Example

```JavaScript
const info = await ipfs.dht.findPeer('QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt')

console.log(info.id)
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

## `ipfs.dht.findProvs(cid, [options])`

> Find peers that can provide a specific value, given a CID.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | The CID of the content to find |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| numProviders | `Number` | 20 | How many providers to find |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

Note that if `options.numProviders` are not found an error will be thrown.

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<{ id: String, addrs: Multiaddr[] }>` | A async iterable that yields objects with `id` and `addrs`. `id` is a String - the peer's ID and `addrs` is an array of [Multiaddr](https://github.com/multiformats/js-multiaddr/) - addresses for the peer. |

### Example

```JavaScript
const providers = ipfs.dht.findProvs('QmdPAhQRxrDKqkGPvQzBvjYe3kU8kiEEAd2J6ETEamKAD9')

for await (const provider of providers) {
  console.log(provider.id.toString())
}
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dht.get(key, [options])`

> Given a key, query the routing system for its best value.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | `Uint8Array` or `string` | The key associated with the value to find |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Uint8Array>` | The value that was stored under that key |

### Example

```JavaScript
const value = await ipfs.dht.get(key)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dht.provide(cid, [options])`

> Announce to the network that you are providing given values.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] or Array<[CID][]> | The key associated with the value to find |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | false | If `true` the entire graph will be provided recursively |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | DHT query messages. See example below for structure. |

Note: You must consume the iterable to completion to complete the provide operation.

### Example

```JavaScript
for await (const message of ipfs.dht.provide('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR')) {
  console.log(message)
}

/*
Prints objects like:

{
  extra: 'dial backoff',
  id: 'QmWtewmnzJiQevJPSmG9s8aC7yRfK2WXTCdRc1pCbDFu6z',
  responses: [
    {
      addrs: [
        Multiaddr(/ip4/127.0.0.1/tcp/4001),
        Multiaddr(/ip4/172.20.0.3/tcp/4001),
        Multiaddr(/ip4/35.178.190.196/tcp/1024)
      ],
      id: 'QmRz5Nth4jTFuJJKcjyb6uwvrhxWbruRvamKY2PJxwJKw8'
    }
  ],
  type: 1
}

For message `type` values, see:
https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L15-L24
*/
```

Alternatively you can simply "drain" the iterable:

```js
import drain from 'it-drain'
await drain(ipfs.dht.provide('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'))
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dht.put(key, value, [options])`

> Write a key/value pair to the routing system.


### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | Uint8Array | The key to put the value as |
| value | Uint8Array | Value to put |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | DHT query messages. See example below for structure. |

### Example

```JavaScript
for await (const message of ipfs.dht.put(key, value)) {
  console.log(message)
}

/*
Prints objects like:

{
  extra: 'dial backoff',
  id: 'QmWtewmnzJiQevJPSmG9s8aC7yRfK2WXTCdRc1pCbDFu6z',
  responses: [
    {
      addrs: [
        Multiaddr(/ip4/127.0.0.1/tcp/4001),
        Multiaddr(/ip4/172.20.0.3/tcp/4001),
        Multiaddr(/ip4/35.178.190.196/tcp/1024)
      ],
      id: 'QmRz5Nth4jTFuJJKcjyb6uwvrhxWbruRvamKY2PJxwJKw8'
    }
  ],
  type: 1
}

For message `type` values, see:
https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L15-L24
*/
```

Alternatively you can simply "drain" the iterable:

```js
import drain from 'it-drain'
await drain(ipfs.dht.put(key, value))
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dht.query(peerId, [options])`

> Find the closest Peer IDs to a given Peer ID by querying the DHT.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| peerId | [PeerID][] or [CID][] | The peer id to query |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | DHT query messages. See example below for structure. |

### Example

```JavaScript
for await (const info of ipfs.dht.query('QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt')) {
  console.log(info)
}

/*
Prints objects like:

{
  extra: 'dial backoff',
  id: 'QmWtewmnzJiQevJPSmG9s8aC7yRfK2WXTCdRc1pCbDFu6z',
  responses: [
    {
      addrs: [
        Multiaddr(/ip4/127.0.0.1/tcp/4001),
        Multiaddr(/ip4/172.20.0.3/tcp/4001),
        Multiaddr(/ip4/35.178.190.196/tcp/1024)
      ],
      id: 'QmRz5Nth4jTFuJJKcjyb6uwvrhxWbruRvamKY2PJxwJKw8'
    }
  ],
  type: 1
}

For message `type` values, see:
https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L15-L24
*/
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/dht
[peerid]: https://www.npmjs.com/package/peer-id
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

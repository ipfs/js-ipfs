# Miscellaneous API <!-- omit in toc -->

- [`ipfs.id([options])`](#ipfsidoptions)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.version([options])`](#ipfsversionoptions)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.dns(domain, [options])`](#ipfsdnsdomain-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.stop([options])`](#ipfsstopoptions)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.ping(peerId, [options])`](#ipfspingpeerid-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)
- [`ipfs.resolve(name, [options])`](#ipfsresolvename-options)
  - [Parameters](#parameters-5)
  - [Options](#options-5)
  - [Returns](#returns-5)
  - [Example](#example-5)

## `ipfs.id([options])`

> Returns the identity of the Peer

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object with the Peer identity |

The Peer identity has the following properties:

- `id: String` - the Peer ID
- `publicKey: String` - the public key of the peer as a base64 encoded string
- `addresses: Multiaddr[]` - A list of multiaddrs this node is listening on
- `agentVersion: String` - The agent version
- `protocolVersion: String` - The supported protocol version
- `protocols: String[]` - The supported protocols

### Example

```JavaScript
const identity = await ipfs.id()
console.log(identity)
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/id.js) can be found in the tests for this API.

## `ipfs.version([options])`

> Returns the implementation version

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object with the version of the implementation, the commit and the Repo. `js-ipfs` instances will also return the version of `interface-ipfs-core` and `ipfs-http-client` supported by this node |

### Example

```JavaScript
const version = await ipfs.version()
console.log(version)
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/version.js) can be found in the tests for this API.

## `ipfs.dns(domain, [options])`

> Resolve DNS links

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| domain | String | The domain to resolve |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `true` | Resolve until result is not a domain name |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<String>` | A string representing the IPFS path for that domain |

### Example

```JavaScript
const path = await ipfs.dns('ipfs.io')
console.log(path)
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/dns.js) can be found in the tests for this API.

## `ipfs.stop([options])`

> Stops the IPFS node and in case of talking with an IPFS Daemon, it stops the process.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

### Example

```JavaScript
await ipfs.stop()
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/stop.js) can be found in the tests for this API.

## `ipfs.ping(peerId, [options])`

> Send echo request packets to IPFS hosts

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| peerId | [PeerID][] or [CID][] | The remote peer to send packets to |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| count | `Number` | `10` | The number of ping messages to send |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |


Where:

- `peerId` (string) ID of the peer to be pinged.
- `options` is an optional object argument that might include the following properties:
    - `count` (integer, default 10): the number of ping messages to send

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields ping response objects |

Each yielded object is of the form:

```js
{
  success: true,
  time: 1234,
  text: ''
}
```

Note that not all ping response objects are "pongs". A "pong" message can be identified by a truthy `success` property and an empty `text` property. Other ping responses are failures or status updates.

### Example

```JavaScript
for await (const res of ipfs.ping('Qmhash')) {
  if (res.time) {
    console.log(`Pong received: time=${res.time} ms`)
  } else {
    console.log(res.text)
  }
}
```

A great source of [examples](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core/src/ping) can be found in the tests for this API.

## `ipfs.resolve(name, [options])`

> Resolve the value of names to IPFS

There are a number of mutable name protocols that can link among themselves and into IPNS. For example IPNS references can (currently) point at an IPFS object, and DNS links can point at other DNS links, IPNS entries, or IPFS objects. This command accepts any of these identifiers and resolves them to the referenced item.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | String | The name to resolve |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `true` | Resolve until result is an IPFS name |
| cidBase | `String` | `base58btc` | Multibase codec name the CID in the resolved path will be encoded with |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<String>` | A string representing the resolved name |

### Example

Resolve the value of your identity:

```JavaScript
const name = '/ipns/QmatmE9msSfkKxoffpHwNLNKgwZG8eT9Bud6YoPab52vpy'

const res = await ipfs.resolve(name)
console.log(res) // /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
```

Resolve the value of another name recursively:

```JavaScript
const name = '/ipns/QmbCMUZw6JFeZ7Wp9jkzbye3Fzp2GGcPgC3nmeUjfVF87n'

// Where:
// /ipns/QmbCMUZw6JFeZ7Wp9jkzbye3Fzp2GGcPgC3nmeUjfVF87n
// ...resolves to:
// /ipns/QmatmE9msSfkKxoffpHwNLNKgwZG8eT9Bud6YoPab52vpy
// ...which in turn resolves to:
// /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj

const res = await ipfs.resolve(name, { recursive: true })
console.log(res) // /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
```

Resolve the value of an IPFS path:

```JavaScript
const name = '/ipfs/QmeZy1fGbwgVSrqbfh9fKQrAWgeyRnj7h8fsHS1oy3k99x/beep/boop'

const res = await ipfs.resolve(name)
console.log(res) // /ipfs/QmYRMjyvAiHKN9UTi8Bzt1HUspmSRD8T8DwxfSMzLgBon1
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/resolve.js) can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
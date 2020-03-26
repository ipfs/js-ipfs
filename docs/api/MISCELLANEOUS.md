# Miscellaneous API

* [id](#id)
* [version](#version)
* [dns](#dns)
* [stop](#stop)
* [ping](#ping)
* [resolve](#resolve)

#### `id`

> Returns the identity of the Peer

##### `ipfs.id()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object with the Peer identity |

The Peer identity has the following properties:

- `id: String` - the Peer ID
- `publicKey: String` - the public key of the peer as a base64 encoded string
- `addresses: Multiaddr[]` - A list of multiaddrs this node is listening on
- `agentVersion: String` - The agent version
- `protocolVersion: String` - The supported protocol version

**Example:**

```JavaScript
const identity = await ipfs.id()
console.log(identity)
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/id.js) can be found in the tests for this API.

#### `version`

> Returns the implementation version

##### `ipfs.version()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object with the version of the implementation, the commit and the Repo |

**Example:**

```JavaScript
const version = await ipfs.version()
console.log(version)
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/version.js) can be found in the tests for this API.

#### `dns`

> Resolve DNS links

##### `ipfs.dns(domain, [options])`

Where:

- `options` is an optional object argument that might include the following properties:
    - `recursive` (boolean, default true): resolve until result is not a domain name

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<String>` | A string representing the IPFS path for that domain |

**Example:**

```JavaScript
const path = await ipfs.dns('ipfs.io')
console.log(path)
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/dns.js) can be found in the tests for this API.

#### `stop`

> Stops the IPFS node and in case of talking with an IPFS Daemon, it stops the process.

##### `ipfs.stop()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.stop()
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/miscellaneous/stop.js) can be found in the tests for this API.

#### `ping`

> Send echo request packets to IPFS hosts

##### `ipfs.ping(peerId, [options])`

Where:

- `peerId` (string) ID of the peer to be pinged.
- `options` is an optional object argument that might include the following properties:
    - `count` (integer, default 10): the number of ping messages to send

**Returns**

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

**Example:**

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

#### `resolve`

> Resolve the value of names to IPFS

There are a number of mutable name protocols that can link among themselves and into IPNS. For example IPNS references can (currently) point at an IPFS object, and DNS links can point at other DNS links, IPNS entries, or IPFS objects. This command accepts any of these identifiers and resolves them to the referenced item.

##### `ipfs.resolve(name, [options])`

Where:

- `name` (string): The name to resolve
- `options` is an optional object that might include the following properties:
  - `recursive` (boolean, default false): Resolve until the result is an IPFS name
  - `cidBase` (string): Multibase codec name the CID in the resolved path will be encoded with

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<String>` | A string representing the resolved name |

**Examples:**

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

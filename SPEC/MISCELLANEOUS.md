# Miscellaneous API

* [id](#id)
* [version](#version)
* [dns](#dns)
* [stop](#stop)
* [ping](#ping)
* [pingPullStream](#pingpullstream)
* [pingReadableStream](#pingreadablestream)
* [resolve](#resolve)

#### `id`

> Returns the identity of the Peer

##### `Go` **WIP**

##### `JavaScript` - ipfs.id([callback])

`callback` must follow `function (err, identity) {}` signature, where `err` is an error if the operation was not successful. `identity` is an object with the Peer identity.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.id(function (err, identity) {
  if (err) {
    throw err
  }
  console.log(identity)
})
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous/id.js) can be found in the tests for this API.

#### `version`

> Returns the implementation version

##### `Go` **WIP**

##### `JavaScript` - ipfs.version([callback])

`callback` must follow `function (err, version) {}` signature, where `err` is an error if the operation was not successful. `version` is an object with the version of the implementation, the commit and the Repo.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.version((err, version) => {
  if (err) {
    throw err
  }
  console.log(version)
})
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous/version.js) can be found in the tests for this API.

#### `dns`

> Resolve DNS links

##### `Go` **WIP**

##### `JavaScript` - ipfs.dns(domain, [callback])

`callback` must follow `function (err, path) {}` signature, where `err` is an error if the operation was not successful. `path` is the IPFS path for that domain.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.dns('ipfs.io', (err, path) => {
  if (err) {
    throw err
  }
  console.log(path)
})
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous/dns.js) can be found in the tests for this API.

#### `stop`

> Stops the IPFS node and in case of talking with an IPFS Daemon, it stops the process.

##### `Go` **WIP**

##### `JavaScript` - ipfs.stop([callback])

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.
If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.stop((err) => {
  if (err) {
    throw err
  }
})
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous/stop.js) can be found in the tests for this API.

#### `ping`

> Send echo request packets to IPFS hosts

##### `Go` **WIP**

##### `JavaScript` - ipfs.ping(peerId, [options], [callback])

Where:

- `peerId` (string) ID of the peer to be pinged.
- `options` is an optional object argument that might include the following properties:
    - `count` (integer, default 10): the number of ping messages to send
- `callback` must follow `function (err, responses) {}` signature, where `err` is an error if the operation was not successful. `responses` is an Array of ping response objects of the form:

    ```js
    {
      success: true,
      time: 1234,
      text: ''
    }
    ```

    Note that not all ping response objects are "pongs". A "pong" message can be identified by a truthy `success` property and an empty `text` property. Other ping responses are failures or status updates.

    If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.ping('Qmhash', function (err, responses) {
  if (err) {
    throw err
  }

  responses.forEach((res) => {
    if (res.time) {
      console.log(`Pong received: time=${res.time} ms`)
    } else {
      console.log(res.text)
    }
  })
})
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/tree/master/js/src/ping) can be found in the tests for this API.

#### `pingPullStream`

> Stream echo request packets to IPFS hosts

##### `Go` **WIP**

##### `JavaScript` - ipfs.pingPullStream(peerId, [options], [callback])

Where:

- `peerId` (string) ID of the peer to be pinged.
- `options` is an optional object argument that might include the following properties:
    - `count` (integer, default 10): the number of ping messages to send

Returns a [`PullStream`][ps] of ping response objects of the form:

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
const pull = require('pull-stream')

pull(
  ipfs.pingPullStream('Qmhash'),
  pull.drain((res) => {
    if (res.time) {
      console.log(`Pong received: time=${res.time} ms`)
    } else {
      console.log(res.text)
    }
  })
)
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/tree/master/js/src/ping) can be found in the tests for this API.

#### `pingReadableStream`

> Stream echo request packets to IPFS hosts

##### `Go` **WIP**

##### `JavaScript` - ipfs.pingReadableStream(peerId, [options], [callback])

Where:

- `peerId` (string) ID of the peer to be pinged.
- `options` is an optional object argument that might include the following properties:
    - `count` (integer, default 10): the number of ping messages to send

Returns a [`ReadableStream`][rs] of ping response objects of the form:

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
const stream = ipfs.pingReadableStream('Qmhash')

stream.on('data', (res) => {
  if (res.time) {
    console.log(`Pong received: time=${res.time} ms`)
  } else {
    console.log(res.text)
  }
})
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/tree/master/js/src/ping) can be found in the tests for this API.

#### `resolve`

> Resolve the value of names to IPFS

There are a number of mutable name protocols that can link among themselves and into IPNS. For example IPNS references can (currently) point at an IPFS object, and DNS links can point at other DNS links, IPNS entries, or IPFS objects. This command accepts any of these identifiers and resolves them to the referenced item.

##### `Go` **WIP**

##### `JavaScript` - ipfs.resolve(name, [options], [callback])

Where:

- `name` (string): The name to resolve
- `options` is an optional object that might include the following properties:
  - `recursive` (boolean, default false): Resolve until the result is an IPFS name

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` is a string, the resolved name.

If no `callback` is passed, a promise is returned.

**Examples:**

Resolve the value of your identity:

```JavaScript
const name = '/ipns/QmatmE9msSfkKxoffpHwNLNKgwZG8eT9Bud6YoPab52vpy'

ipfs.resolve(name, (err, res) => {
  if (err) {
    throw err
  }
  console.log(res) // /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
})
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

ipfs.resolve(name, { recursive: true }, (err, res) => {
  if (err) {
    throw err
  }
  console.log(res) // /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
})
```

Resolve the value of an IPFS path:

```JavaScript
const name = '/ipfs/QmeZy1fGbwgVSrqbfh9fKQrAWgeyRnj7h8fsHS1oy3k99x/beep/boop'

ipfs.resolve(name, (err, res) => {
  if (err) {
    throw err
  }
  console.log(res) // /ipfs/QmYRMjyvAiHKN9UTi8Bzt1HUspmSRD8T8DwxfSMzLgBon1
})
```

A great source of [examples](https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous/resolve.js) can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream

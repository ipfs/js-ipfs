# Miscellaneous API

* [id](#id)
* [version](#version)
* [dns](#dns)
* [stop](#stop)
* [ping](#ping)
* [pingPullStream](#pingpullstream)
* [pingReadableStream](#pingreadablestream)

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

A great source of [examples][] can be found in the tests for this API.

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

A great source of [examples][] can be found in the tests for this API.

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

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous.js

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

A great source of [examples][] can be found in the tests for this API.

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

A great source of [examples][] can be found in the tests for this API.

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

A great source of [examples][] can be found in the tests for this API.

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

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/miscellaneous
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream

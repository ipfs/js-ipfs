Swarm API
=========

#### `addrs`

> List of known addresses of each peer connected.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.addrs([callback])

`callback` must follow `function (err, addrs) {}` signature, where `err` is an error if the operation was not successful. `addrs` will be an array of [`PeerInfo`](https://github.com/libp2p/js-peer-info)s.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.swarm.addrs(function (err, addrs) {
  if (err) {
    throw err
  }
  console.log(addrs)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `connect`

> Open a connection to a given address.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.connect(addr, [callback])

Where `addr` is of type [multiaddr](https://github.com/multiformats/js-multiaddr)

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.swarm.connect(addr, function (err) {
  if (err) {
    throw err
  }
  // if no err is present, connection is now open
})
```

A great source of [examples][] can be found in the tests for this API.

#### `disconnect`

> Close a connection on a given address.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.disconnect(addr, [callback])

Where `addr` is of type [multiaddr](https://github.com/multiformats/js-multiaddr)

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.swarm.disconnect(addr, function (err) {})
```

A great source of [examples][] can be found in the tests for this API.

#### `peers`

> List out the peers that we have connections with.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.peers([opts] [, callback])

If `opts.verbose` is set to `true` additional information, such as `latency` is provided.

`callback` must follow `function (err, peerInfos) {}` signature, where `err` is an error if the operation was not successful. `peerInfos` will be an array of the form

- `addr: Multiaddr`
- `peer: [PeerInfo]()`
- `latency: String` Only if `verbose: true`  was passed

Starting with `go-ipfs 0.4.5` these additional properties are provided

- `muxer: String` - The type of stream muxer the peer is usng
- `streams: []String` - Only if `verbose: true`, a list of currently open streams

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.swarm.peers(function (err, peerInfos) {
  if (err) {
    throw err
  }
  console.log(peerInfos)
})
```

A great source of [examples][] can be found in the tests for this API.

------------------------------

> NOT IMPLEMENTED YET

#### `filters`

> Display current multiaddr filters. Filters are a way to set up rules for the network connections established.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.filters([callback])

`callback` must follow `function (err, filters) {}` signature, where `err` is an error if the operation was not successful. `filters` is an array of multiaddrs that represent the filters being applied.

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.swarm.filters(function (err, filters) {})
```

#### `filters.add`

> Add another filter.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.filters.add(filter, [callback])

Where `filter` is of type [multiaddr]()

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.swarm.filters.add(filter, function (err) {})
```

#### `filters.rm`

> Remove a filter

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.filters.rm(filter, [callback])

Where `filter` is of type [multiaddr]()

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.swarm.filters.rm(filter, function (err) {})
```

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/swarm.js

Swarm API
=========

#### `addrs`

> List of known addresses of each peer connected.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.addrs([callback])

`callback` must follow `function (err, addrs) {}` signature, where `err` is an error if the operation was not successful. `addrs` will be an array of multiaddrs.

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.swarm.addrs(function (err, addrs) {})
```

#### `connect`

> Open a connection to a given address.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.connect(addr, [callback])

Where `addr` is of type [multiaddr](https://github.com/multiformats/js-multiaddr)

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. 

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.swarm.connect(addr, function (err) {
  // if no err is present, connection is now open
})
```

#### `disconnect`

> Close a connection on a given address.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.disconnect(addr, [callback])

Where `addr` is of type [multiaddr](https://github.com/multiformats/js-multiaddr)

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful. 

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.swarm.disconnect(addr, function (err) {})
```

#### `peers`

> List out the peers that we have connections with.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.peers([callback])

`callback` must follow `function (err, peerInfos) {}` signature, where `err` is an error if the operation was not successful. `peerInfos` will be an array of [PeerInfo]().

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.swarm.peers(function (err, peerInfos) {})
```

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



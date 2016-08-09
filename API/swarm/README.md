swarm API
=========

#### `addrs`

> List of known addresses (from the peer).

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

##### `JavaScript` - ipfs.swarm.SOMETHING(data, [callback])

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

If no `callback` is passed, a promise is returned.

Example:


#### `disconnect`

> Close a connection on a given address.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.SOMETHING(data, [callback])

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

If no `callback` is passed, a promise is returned.

Example:


#### `filters`

> Manipulate address filters

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.filters(data, [callback])

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

If no `callback` is passed, a promise is returned.

Example:


#### `peers`

> List out the peers that we have connections with.

##### `Go` **WIP**

##### `JavaScript` - ipfs.swarm.peers(data, [callback])

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

If no `callback` is passed, a promise is returned.

Example:




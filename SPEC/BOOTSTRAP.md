Bootstrap API
=============

> Manipulates the `bootstrap list`, which contains
  the addresses of the bootstrap nodes. These are the trusted peers from
  which to learn about other peers in the network.
  
> Only edit this list if you understand the risks of adding or removing nodes from this list.

#### `add`

> Add a peer address to the bootstrap list

##### `Go` **WIP**

##### `JavaScript` - ipfs.bootstrap.add(addr, [opts,] callback)

- `addr` is a [multiaddr](https://github.com/multiformats/js-multiaddr) to a peer node
- `opts.default` if true, add the default peers to the list
- `callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res.Peers` is an array of added addresses.

#### `list`

> List all peer addresses in the bootstrap list

##### `Go` **WIP**

##### `JavaScript` - ipfs.bootstrap.list(callback)

- `callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res.Peers` is an array of addresses.


#### `rm`

> Remove a peer address from the bootstrap list

##### `Go` **WIP**

##### `JavaScript` - ipfs.bootstrap.rm(peer, [opt,] callback)

- `addr` is a [multiaddr](https://github.com/multiformats/js-multiaddr) to a peer node
- `opts.all` if true, remove all peers from the list
- `callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res.Peers` is an array of removed addresses.

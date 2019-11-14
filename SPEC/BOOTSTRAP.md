# Bootstrap API

> Manipulates the `bootstrap list`, which contains
  the addresses of the bootstrap nodes. These are the trusted peers from
  which to learn about other peers in the network.

> Only edit this list if you understand the risks of adding or removing nodes from this list.

* [bootstrap.add](#bootstrapadd)
* [bootstrap.list](#bootstraplist)
* [bootstrap.rm](#bootstraprm)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `bootstrap.add`

> Add a peer address to the bootstrap list

##### `ipfs.bootstrap.add(addr, [options])`

- `addr` is a [multiaddr](https://github.com/multiformats/js-multiaddr) to a peer node
- `options.default` if true, add the default peers to the list

Note: If passing the `default` option, `addr` is an optional parameter (may be `undefined`/`null`) and options may be passed as the first argument. i.e. `ipfs.bootstrap.add({ default: true })`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains an array with all the added addresses |

example of the returned object:

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

**Example:**

```JavaScript
const validIp4 = '/ip4/104....9z'

const res = await ipfs.bootstrap.add(validIp4)
console.log(res.Peers)
// Logs:
// ['/ip4/104....9z']
```

A great source of [examples][] can be found in the tests for this API.

#### `bootstrap.list`

> List all peer addresses in the bootstrap list

##### `ipfs.bootstrap.list()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains an array with all the bootstrap addresses |

example of the returned object:

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

**Example:**

```JavaScript
const res = await ipfs.bootstrap.list()
console.log(res.Peers)
// Logs:
// [address1, address2, ...]
```

A great source of [examples][] can be found in the tests for this API.

#### `bootstrap.rm`

> Remove a peer address from the bootstrap list

##### `ipfs.bootstrap.rm(peer, [options])`

- `addr` is a [multiaddr](https://github.com/multiformats/js-multiaddr) to a peer node
- `options.all` if true, remove all peers from the list

Note: If passing the `all` option, `addr` is an optional parameter (may be `undefined`/`null`) and options may be passed as the first argument. i.e. `ipfs.bootstrap.rm({ all: true })`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains an array with all the removed addresses |

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

**Example:**

```JavaScript
const res = await ipfs.bootstrap.rm(null, { all: true })
console.log(res.Peers)
// Logs:
// [address1, address2, ...]
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/bootstrap

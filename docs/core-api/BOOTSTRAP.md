# Bootstrap API <!-- omit in toc -->

> Manipulates the bootstrap list, which contains the addresses of the bootstrap nodes. These are the trusted peers from which to learn about other peers in the network.

Warning: your node requires bootstrappers to join the network and find other peers.

If you edit this list, you may find you have reduced or no connectivity.  If this is the case, please reset your node's bootstrapper list with `ipfs.bootstrap.reset()`.

- [`ipfs.bootstrap.add(addr, [options])`](#ipfsbootstrapaddaddr-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.bootstrap.reset([options])`](#ipfsbootstrapresetoptions)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.bootstrap.list([options])`](#ipfsbootstraplistoptions)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.bootstrap.rm(addr, [options])`](#ipfsbootstraprmaddr-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.bootstrap.clear([options])`](#ipfsbootstrapclearoptions)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)

## `ipfs.bootstrap.add(addr, [options])`

> Add a peer address to the bootstrap list

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| addr | [MultiAddr][] | The address of a network peer |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains an array with all the added addresses |

example of the returned object:

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

### Example

```JavaScript
const validIp4 = '/ip4/104....9z'

const res = await ipfs.bootstrap.add(validIp4)
console.log(res.Peers)
// Logs:
// ['/ip4/104....9z']
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.bootstrap.reset([options])`

> Reset the bootstrap list to contain only the default bootstrap nodes

### Parameters

None.

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<{ Peers: Array<MultiAddr> }>` | An object that contains an array with all the added addresses |

example of the returned object:

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

### Example

```JavaScript
const res = await ipfs.bootstrap.reset()
console.log(res.Peers)
// Logs:
// ['/ip4/104....9z']
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.bootstrap.list([options])`

> List all peer addresses in the bootstrap list

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
| `Promise<Object>` | An object that contains an array with all the bootstrap addresses |

example of the returned object:

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

### Example

```JavaScript
const res = await ipfs.bootstrap.list()
console.log(res.Peers)
// Logs:
// [address1, address2, ...]
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.bootstrap.rm(addr, [options])`

> Remove a peer address from the bootstrap list

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| addr | [MultiAddr][] | The address of a network peer |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<{ Peers: Array<MultiAddr> }>` | An object that contains an array with all the removed addresses |

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

### Example

```JavaScript
const res = await ipfs.bootstrap.rm('address1')
console.log(res.Peers)
// Logs:
// [address1, ...]
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.bootstrap.clear([options])`

> Remove all peer addresses from the bootstrap list

### Parameters

None.

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains an array with all the removed addresses |

```JavaScript
{
  Peers: [address1, address2, ...]
}
```

### Example

```JavaScript
const res = await ipfs.bootstrap.clear()
console.log(res.Peers)
// Logs:
// [address1, address2, ...]
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/bootstrap
[MultiAddr]: https://github.com/multiformats/js-multiaddr
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

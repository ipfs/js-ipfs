# Swarm API <!-- skip in toc -->

- [Swarm API](#swarm-api)
  - [`ipfs.swarm.addrs([options])`](#ipfsswarmaddrsoptions)
    - [Parameters](#parameters)
    - [Options](#options)
    - [Returns](#returns)
    - [Example](#example)
  - [`ipfs.swarm.connect(addr, [options])`](#ipfsswarmconnectaddr-options)
    - [Parameters](#parameters-1)
    - [Options](#options-1)
    - [Returns](#returns-1)
    - [Example](#example-1)
  - [`ipfs.swarm.disconnect(addr, [options])`](#ipfsswarmdisconnectaddr-options)
    - [Parameters](#parameters-2)
    - [Options](#options-2)
    - [Returns](#returns-2)
    - [Example](#example-2)
  - [`ipfs.swarm.localAddrs([options])`](#ipfsswarmlocaladdrsoptions)
    - [Parameters](#parameters-3)
    - [Options](#options-3)
    - [Returns](#returns-3)
    - [Example](#example-3)
  - [`ipfs.swarm.peers([options])`](#ipfsswarmpeersoptions)
    - [Parameters](#parameters-4)
    - [Options](#options-4)
    - [Returns](#returns-4)
    - [Example](#example-4)

## `ipfs.swarm.addrs([options])`

> List of known addresses of each peer connected.

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
| `Promise<Array<{ id: String, addrs: Multiaddr[] }>>` | A promise that resolves to an array of objects with `id` and `addrs`. `id` is a String - the peer's ID and `addrs` is an array of [Multiaddr](https://github.com/multiformats/js-multiaddr/) - addresses for the peer. |

### Example

```JavaScript
const peerInfos = await ipfs.swarm.addrs()

peerInfos.forEach(info => {
  console.log(info.id)
  /*
  QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt
  */

  info.addrs.forEach(addr => console.log(addr.toString()))
  /*
  /ip4/147.75.94.115/udp/4001/quic
  /ip6/2604:1380:3000:1f00::1/udp/4001/quic
  /dnsaddr/bootstrap.libp2p.io
  /ip6/2604:1380:3000:1f00::1/tcp/4001
  /ip4/147.75.94.115/tcp/4001
  */
})

```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.swarm.connect(addr, [options])`

> Open a connection to a given address.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| addr | [MultiAddr][] | The object to search for references |

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
await ipfs.swarm.connect(addr)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.swarm.disconnect(addr, [options])`

> Close a connection on a given address.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| addr | [MultiAddr][] | The object to search for references |

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
await ipfs.swarm.disconnect(addr)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.swarm.localAddrs([options])`

> Local addresses this node is listening on.

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
| `Promise<Multiaddr[]>` | An array of [`Multiaddr`](https://github.com/multiformats/js-multiaddr) representing the local addresses the node is listening |

### Example

```JavaScript
const multiAddrs = await ipfs.swarm.localAddrs()
console.log(multiAddrs)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.swarm.peers([options])`

> List out the peers that we have connections with.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| direction | `boolean` | `false` | If true, return connection direction information |
| streams | `boolean` | `false` | If true, return information about open muxed streams |
| verbose | `boolean` | `false` | If true, return all extra information |
| latency | `boolean` | `false` | If true, return latency information |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object[]>` | An array with the list of peers that the node have connections with |

The returned array has the following form:

- `addr: Multiaddr`
- `peer: String`
- `latency: String` - Only if `verbose: true`  was passed
- `muxer: String` - The type of stream muxer the peer is usng
- `streams: string[]` - Only if `verbose: true`, a list of currently open streams
- `direction: number` - Inbound or outbound connection

If an error occurs trying to create an individual object, it will have the properties:

- `error: Error` - the error that occurred
- `rawPeerInfo: Object` - the raw data for the peer

All other properties may be `undefined`.

### Example

```JavaScript
const peerInfos = await ipfs.swarm.peers()
console.log(peerInfos)
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/swarm
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[MultiAddr]: https://github.com/multiformats/js-multiaddr

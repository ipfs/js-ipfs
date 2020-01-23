# Swarm API

* [swarm.addrs](#swarmaddrs)
* [swarm.connect](#swarmconnect)
* [swarm.disconnect](#swarmdisconnect)
* [swarm.localAddrs](#swarmlocaladdrs)
* [swarm.peers](#swarmpeers)
* [swarm.filters.add](#swarmfiltersadd) (not implemented yet)
* [swarm.filters.rm](#swarmfiltersrm) (not implemented yet)

#### `swarm.addrs`

> List of known addresses of each peer connected.

##### `ipfs.swarm.addrs()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<{ id: CID, addrs: Multiaddr[] }>` | A promise that resolves to an object with `id` and `addrs`. `id` is a [`CID`](https://github.com/multiformats/js-cid) - the peer's ID and `addrs` is an array of [Multiaddr](https://github.com/multiformats/js-multiaddr/) - addresses for the peer. |

**Example:**

```JavaScript
const peerInfos = await ipfs.swarm.addrs()

peerInfos.forEach(info => {
  console.log(info.id.toString())
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

#### `swarm.connect`

> Open a connection to a given address.

##### `ipfs.swarm.connect(addr)`

Where `addr` is of type [multiaddr](https://github.com/multiformats/js-multiaddr)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.swarm.connect(addr)
```

A great source of [examples][] can be found in the tests for this API.

#### `swarm.disconnect`

> Close a connection on a given address.

##### `ipfs.swarm.disconnect(addr)`

Where `addr` is of type [multiaddr](https://github.com/multiformats/js-multiaddr)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.swarm.disconnect(addr)
```

A great source of [examples][] can be found in the tests for this API.

#### `swarm.localAddrs`

> Local addresses this node is listening on.

##### `ipfs.swarm.localAddrs()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Multiaddr[]>` | An array of [`Multiaddr`](https://github.com/multiformats/js-multiaddr) representing the local addresses the node is listening |

**Example:**

```JavaScript
const multiAddrs = await ipfs.swarm.localAddrs()
console.log(multiAddrs)
```

A great source of [examples][] can be found in the tests for this API.

#### `swarm.peers`

> List out the peers that we have connections with.

##### `ipfs.swarm.peers([options])`

`options` an optional object with the following properties:
  - `direction` - set to `true` to return connection direction information. Default `false`
  - `streams` - set to `true` to return information about open muxed streams. Default `false`
  - `verbose` - set to `true` to return all extra information. Default `false`
  - `latency` - set to `true` to return latency information. Default `false`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object[]>` | An array with the list of peers that the node have connections with |

The returned array has the following form:

- `addr: Multiaddr`
- `peer: CID`
- `latency: String` - Only if `verbose: true`  was passed
- `muxer: String` - The type of stream muxer the peer is usng
- `streams: string[]` - Only if `verbose: true`, a list of currently open streams
- `direction: number` - Inbound or outbound connection

If an error occurs trying to create an individual object, it will have the properties:

- `error: Error` - the error that occurred
- `rawPeerInfo: Object` - the raw data for the peer

All other properties may be `undefined`.

**Example:**

```JavaScript
const peerInfos = await ipfs.swarm.peers()
console.log(peerInfos)
```

A great source of [examples][] can be found in the tests for this API.

------------------------------

> NOT IMPLEMENTED YET

#### `swarm.filters`

> Display current multiaddr filters. Filters are a way to set up rules for the network connections established.

##### `ipfs.swarm.filters()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of multiaddrs that represent the filters being applied |

Example:

```JavaScript
const filters = await ipfs.swarm.filters()
```

#### `swarm.filters.add`

> Add another filter.

##### `ipfs.swarm.filters.add(filter)`

Where `filter` is of type [multiaddr]()

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

Example:

```JavaScript
await ipfs.swarm.filters.add(filter)
```

#### `swarm.filters.rm`

> Remove a filter

##### `ipfs.swarm.filters.rm(filter)`

Where `filter` is of type [multiaddr]()

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

Example:

```JavaScript
await ipfs.swarm.filters.rm(filter)
```

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/swarm

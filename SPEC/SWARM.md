# Swarm API

* [swarm.addrs](#swarmaddrs)
* [swarm.connect](#swarmconnect)
* [swarm.disconnect](#swarmdisconnect)
* [swarm.localAddrs](#swarmlocaladdrs)
* [swarm.peers](#swarmpeers)
* [swarm.filters.add](#swarmfiltersadd) (not implemented yet)
* [swarm.filters.rm](#swarmfiltersrm) (not implemented yet)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `swarm.addrs`

> List of known addresses of each peer connected.

##### `ipfs.swarm.addrs()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of of [`PeerInfo`](https://github.com/libp2p/js-peer-info)s |

**Example:**

```JavaScript
const peerInfos = await ipfs.swarm.addrs()
console.log(peerInfos)
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
| `Promise<Array>` | An array of [`MultiAddr`](https://github.com/multiformats/js-multiaddr) representing the local addresses the node is listening |

**Example:**

```JavaScript
const multiAddrs = await ipfs.swarm.localAddrs()
console.log(multiAddrs)
```

A great source of [examples][] can be found in the tests for this API.

#### `swarm.peers`

> List out the peers that we have connections with.

##### `ipfs.swarm.peers([options])`

If `options.verbose` is set to `true` additional information, such as `latency` is provided.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array with the list of peers that the node have connections with |

the returned array has the following form:

- `addr: Multiaddr`
- `peer: PeerId`
- `latency: String` Only if `verbose: true`  was passed

Starting with `go-ipfs 0.4.5` these additional properties are provided

- `muxer: String` - The type of stream muxer the peer is usng
- `streams: []String` - Only if `verbose: true`, a list of currently open streams

If an error occurs trying to create an individual `peerInfo` object, it will have the properties

- `error: Error` - the error that occurred
- `rawPeerInfo: Object` - the raw data for the peer

and all other properties may be undefined.

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

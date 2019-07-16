# The js-ipfs config file

The js-ipfs config file is a JSON document located in the root
directory of the js-ipfs repository (by default the js-ipfs
repository is located at `~/.jsipfs` and the config file is at
`~/.jsipfs/config`). The repository location may be changed with
the `$IPFS_PATH` environment variable. The config file is read once
when the js-ipfs daemon is started, or each time a command is
executed in offline mode. Commands that execute on a running daemon
do not read the config file at runtime.

## Table of Contents

- [`Addresses`](#addresses)
- [`Bootstrap`](#bootstrap)
- [`Datastore`](#datastore)
- [`Discovery`](#discovery)
- [`Identity`](#identity)
- [`Swarm`](#swarm)


## `Addresses`
Contains information about various listener addresses to be used by this node.

- `API`
The IPFS daemon exposes an HTTP API that allows to control the node and
run the same commands as you can do from the command line. It is defined
on the [HTTP API Spec](https://docs.ipfs.io/reference/api/http).

Multiaddr describing the address to serve the local HTTP API on.

Default: `/ip4/127.0.0.1/tcp/5002`

- `Gateway`
A gateway is exposed by the IPFS daemon, which allows an easy way to
access content from IPFS, using an IPFS path.

Multiaddr describing the address to serve the local gateway on.

Default: `/ip4/127.0.0.1/tcp/9090`

- `Swarm`
Array of multiaddrs describing which addresses to listen on for p2p swarm connections.

Default:
```json
[
  "/ip4/0.0.0.0/tcp/4002",
  "/ip4/127.0.0.1/tcp/4003/ws"
]
```

## `Bootstrap`
Bootstrap is an array of multiaddrs of trusted nodes to connect to in order to
initiate a connection to the network.

## `Datastore`
Contains information related to the construction and operation of the on-disk
storage system.

- `Spec`
Spec defines the structure of the ipfs datastore. It is a composable structure, where each datastore is represented by a json object. Datastores can wrap other datastores to provide extra functionality (eg metrics, logging, or caching).

This can be changed manually, however, if you make any changes that require a different on-disk structure, you will need to run the [ipfs-ds-convert tool](https://github.com/ipfs/ipfs-ds-convert) to migrate data into the new structures.

For more information on possible values for this configuration option, see docs/datastores.md

Default:
```
{
  "mounts": [
	{
	  "child": {
		"path": "blocks",
		"shardFunc": "/repo/flatfs/shard/v1/next-to-last/2",
		"sync": true,
		"type": "flatfs"
	  },
	  "mountpoint": "/blocks",
	  "prefix": "flatfs.datastore",
	  "type": "measure"
	},
	{
	  "child": {
		"compression": "none",
		"path": "datastore",
		"type": "levelds"
	  },
	  "mountpoint": "/",
	  "prefix": "leveldb.datastore",
	  "type": "measure"
	}
  ],
  "type": "mount"
}
```

## `Discovery`
Contains options for configuring ipfs node discovery mechanisms.

- `MDNS`
Multicast dns is a discovery protocol that is able to find other peers
on the local network.

Options for multicast dns peer discovery.

  - `Enabled`
A boolean value for whether or not mdns should be active.

Default: `true`

  -  `Interval`
A number of seconds to wait between discovery checks.

Default: `10`

- `webRTCStar`
WebRTCStar is a discovery mechanism prvided by a signalling-star that allows peer-to-peer communications in the browser.  

Options for webRTCstar peer discovery.

  - `Enabled`
A boolean value for whether or not webRTCStar should be active.

Default: `true`

## `Identity`

- `PeerID`
The unique PKI identity label for this configs peer. Set on init and never read,
its merely here for convenience. IPFS will always generate the peerID from its
keypair at runtime.

- `PrivKey`
The base64 encoded protobuf describing (and containing) the nodes private key.

## `Swarm`

Options for configuring the swarm.

### `ConnMgr`

The connection manager determines which and how many connections to keep and can be configured to keep.

#### Basic Connection Manager

- `LowWater`
LowWater is the minimum number of connections to maintain.

- `HighWater`
HighWater is the number of connections that, when exceeded, will trigger a connection GC operation.


The "basic" connection manager tries to keep between `LowWater` and `HighWater` connections. It works by:

1. Keeping all connections until `HighWater` connections is reached.
2. Once `HighWater` is reached, it closes connections until `LowWater` is reached.

**Example:**


```json
{
  "Swarm": {
    "ConnMgr": {
      "LowWater": 100,
      "HighWater": 200,
    }
  }
}
```

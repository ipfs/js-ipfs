# The js-ipfs config file

The js-ipfs config file is a JSON document located in the root directory of the js-ipfs repository.

## Table of Contents

- [`Addresses`](#addresses)
  - [`API`](#api)
  - [`Delegates`](#delegates)
  - [`Gateway`](#gateway)
  - [`Swarm`](#swarm)
- [`Bootstrap`](#bootstrap)
- [`Datastore`](#datastore)
  - [`Spec`](#spec)
- [`Discovery`](#discovery)
  - [`MDNS`](#mdns)
  - [`webRTCStar`](#webrtcstar)
- [`Identity`](#identity)
  - [`PeerID`](#peerid)
  - [`PrivKey`](#privkey)
- [`Keychain`](#keychain)
- [`Pubsub`](#pubsub)
  - [`Router`](#router)
- [`Swarm`](#swarm)
  - [`ConnMgr`](#connmgr)

## `Addresses`
Contains information about various listener addresses to be used by this node.

### `API`

The IPFS daemon exposes an HTTP API that allows to control the node and run the same commands as you can do from the command line. It is defined on the [HTTP API Spec](https://docs.ipfs.io/reference/api/http).

[Multiaddr](https://github.com/multiformats/multiaddr/) or array of [Multiaddr](https://github.com/multiformats/multiaddr/) describing the address(es) to serve the HTTP API on.

Default: `/ip4/127.0.0.1/tcp/5002`

### `Delegates`

Delegate peers are used to find peers and retrieve content from the network on your behalf.

Array of [Multiaddr](https://github.com/multiformats/multiaddr/) describing which addresses to use as delegate nodes.

Default: `[]`

### `Gateway`

A gateway is exposed by the IPFS daemon, which allows an easy way to access content from IPFS, using an IPFS path.

[Multiaddr](https://github.com/multiformats/multiaddr/) or array of [Multiaddr](https://github.com/multiformats/multiaddr/) describing the address(es) to serve the gateway on.

Default: `/ip4/127.0.0.1/tcp/9090`

### `Swarm`

Array of [Multiaddr](https://github.com/multiformats/multiaddr/) describing which addresses to listen on for p2p swarm connections.

Default:
```json
[
  "/ip4/0.0.0.0/tcp/4002",
  "/ip4/127.0.0.1/tcp/4003/ws"
]
```

## `Bootstrap`

Bootstrap is an array of [Multiaddr](https://github.com/multiformats/multiaddr/) of trusted nodes to connect to in order to
initiate a connection to the network.

## `Datastore`

Contains information related to the construction and operation of the on-disk storage system.

### `Spec`

Spec defines the structure of the IPFS datastore. It is a composable structure, where each datastore is represented by a JSON object. Datastores can wrap other datastores to provide extra functionality (e.g. metrics, logging, or caching).

This can be changed manually, however, if you make any changes that require a different on-disk structure, you will need to run the [ipfs-ds-convert tool](https://github.com/ipfs/ipfs-ds-convert) to migrate data into the new structures.

Default:
```json
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

Contains options for configuring IPFS node discovery mechanisms.

### `MDNS`

Multicast DNS is a discovery protocol that is able to find other peers on the local network.

Options for Multicast DNS peer discovery:

- `Enabled`

    A boolean value for whether or not MDNS should be active.
    
    Default: `true`

-  `Interval`

	  A number of seconds to wait between discovery checks.
    
    Default: `10`

### `webRTCStar`

WebRTCStar is a discovery mechanism prvided by a signalling-star that allows peer-to-peer communications in the browser.  

Options for webRTCstar peer discovery:

- `Enabled`

    A boolean value for whether or not webRTCStar should be active.

    Default: `true`

## `Identity`

### `PeerID`

The unique PKI identity label for this configs peer. Set on init and never read, its merely here for convenience. IPFS will always generate the peerID from its keypair at runtime.

### `PrivKey`

The base64 encoded protobuf describing (and containing) the nodes private key.

## `Keychain`

We can customize the key management and criptographically protected messages by changing the Keychain options. Those options are used for generating the derived encryption key (`DEK`). The `DEK` object, along with the passPhrase, is the input to a PBKDF2 function.

Default:
```json
{
  "dek": {
    "keyLength": 512/8,
    "iterationCount": 1000,
    "salt": "at least 16 characters long",
    "hash": "sha2-512"
  }
}
```

You can check the [parameter choice for pbkdf2](https://cryptosense.com/parameter-choice-for-pbkdf2/) for more information.

## `Pubsub`

Options for configuring the pubsub subsystem.

### `Router`

A string value for specifying which pubsub routing protocol to use. You can either use `gossipsub` in order to use the [ChainSafe/gossipsub-js](https://github.com/ChainSafe/gossipsub-js) implementation, or `floodsub` to use the [libp2p/js-libp2p-floodsub](https://github.com/libp2p/js-libp2p-floodsub) implementation. You can read more about these implementations on the [libp2p/specs/pubsub](https://github.com/libp2p/specs/tree/master/pubsub) document.

Default: `gossipsub`

## `Swarm`

Options for configuring the swarm.

### `ConnMgr`

The connection manager determines which and how many connections to keep and can be configured to keep.

- `LowWater`

    The minimum number of connections to maintain.

    Default: `200` (both browser and node.js)

- `HighWater`

    The number of connections that, when exceeded, will trigger a connection GC operation.

    Default: `500` (both browser and node.js)

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

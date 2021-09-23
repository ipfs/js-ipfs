# The js-ipfs config file <!-- omit in toc -->

The js-ipfs config file is a JSON document located in the root directory of the js-ipfs repository.

## Table of Contents <!-- omit in toc -->

- [Profiles](#profiles)
- [`Addresses`](#addresses)
  - [`API`](#api)
  - [`RPC`](#rpc)
  - [`Delegates`](#delegates)
  - [`Gateway`](#gateway)
  - [`Swarm`](#swarm)
  - [`Announce`](#announce)
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
  - [`Enabled`](#enabled)
- [`Swarm`](#swarm-1)
  - [`ConnMgr`](#connmgr)
  - [`DisableNatPortMap`](#disablenatportmap)
  - [Example](#example)
- [`API`](#api-1)
  - [`HTTPHeaders`](#httpheaders)
    - [`Access-Control-Allow-Origin`](#access-control-allow-origin)
      - [Example](#example-1)
    - [`Access-Control-Allow-Credentials`](#access-control-allow-credentials)
      - [Example](#example-2)

## Profiles

Configuration profiles allow to tweak configuration quickly. Profiles can be
applied with `--profile` flag to `ipfs init` or with the `ipfs config profile
apply` command. When a profile is applied a backup of the configuration file
will be created in `$IPFS_PATH`.

Available profiles:

- `server`

  Recommended for nodes with public IPv4 address (servers, VPSes, etc.),
  disables host and content discovery in local networks.

- `local-discovery`

  Sets default values to fields affected by `server` profile, enables
  discovery in local networks.

- `test`

  Reduces external interference, useful for running ipfs in test environments.
  Note that with these settings node won't be able to talk to the rest of the
  network without manual bootstrap.

- `default-networking`

  Restores default network settings. Inverse profile of the `test` profile.

- `lowpower`

  Reduces daemon overhead on the system. May affect node functionality,
  performance of content discovery and data fetching may be degraded.

- `default-power`

  Inverse of "lowpower" profile.

## `Addresses`

Contains information about various listener addresses to be used by this node.

### `API`

The IPFS daemon exposes an HTTP API that allows to control the node and run the same commands as you can do from the command line. It is defined on the [HTTP API Spec](https://docs.ipfs.io/reference/api/http).

[Multiaddr](https://github.com/multiformats/multiaddr/) or array of [Multiaddr](https://github.com/multiformats/multiaddr/) describing the address(es) to serve the HTTP API on.

Default: `/ip4/127.0.0.1/tcp/5002`

### `RPC`

js-IPFS has a gRPC-over-websockets server that allows it to do things that you cannot do over HTTP like bi-directional streaming.  It implements the same API as the [HTTP API Spec](https://docs.ipfs.io/reference/api/http) and can be accessed using the [ipfs-client](https://www.npmjs.com/package/ipfs-client) module.

Configure the address it listens on using this config key.

Default: `/ip4/127.0.0.1/tcp/5003`

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

### `Announce`

Array of [Multiaddr](https://github.com/multiformats/multiaddr/) describing which addresses to [announce](https://github.com/libp2p/js-libp2p/tree/master/src/address-manager#announce-addresses) over the network.

Default:
```json
[]
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

WebRTCStar is a discovery mechanism provided by a signalling-star that allows peer-to-peer communications in the browser.

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

We can customize the key management and cryptographically protected messages by changing the Keychain options. Those options are used for generating the derived encryption key (`DEK`). The `DEK` object, along with the passPhrase, is the input to a PBKDF2 function.

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

Options for configuring the pubsub subsystem. It is important pointing out that this is not supported in the browser. If you want to configure a different pubsub router in the browser you must configure `libp2p.modules.pubsub` options instead.

### `Router`

A string value for specifying which pubsub routing protocol to use. You can either use `gossipsub` in order to use the [ChainSafe/gossipsub-js](https://github.com/ChainSafe/gossipsub-js) implementation, or `floodsub` to use the [libp2p/js-libp2p-floodsub](https://github.com/libp2p/js-libp2p-floodsub) implementation. You can read more about these implementations on the [libp2p/specs/pubsub](https://github.com/libp2p/specs/tree/master/pubsub) document.

Default: `gossipsub`

### `Enabled`

A boolean value for wether or not pubsub router should be active.

Default: `true`

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

### `DisableNatPortMap`

By default when running under nodejs, libp2p will try to use [UPnP](https://en.wikipedia.org/wiki/Universal_Plug_and_Play) to open a random high port on your router for any TCP connections you have configured.

Set `DisableNatPortMap` to `false` to disable this behaviour.

### Example

```json
{
  "Swarm": {
    "ConnMgr": {
      "LowWater": 100,
      "HighWater": 200,
    }
  },
  "DisableNatPortMap": false
}
```

## `API`

Settings applied to the HTTP RPC API server

### `HTTPHeaders`

HTTP header settings used by the HTTP RPC API server

#### `Access-Control-Allow-Origin`

The RPC API endpoints running on your local node are protected by the [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) mechanism.

When a request is made that sends an `Origin` header, that Origin must be present in the allowed origins configured for the node, otherwise the browser will disallow that request to proceed, unless `mode: 'no-cors'` is set on the request, in which case the response will be opaque.

To allow requests from web browsers, configure the `API.HTTPHeaders.Access-Control-Allow-Origin` setting.  This is an array of URL strings with safelisted Origins.

##### Example

If you are running a webapp locally that you access via the URL `http://127.0.0.1:3000`, you must add it to the list of allowed origins in order to make API requests from that webapp in the browser:

```json
{
  "API": {
    "HTTPHeaders": {
      "Access-Control-Allow-Origin": [
        "http://127.0.0.1:3000"
      ]
    }
  }
}
```

Note that the origin must match exactly so `'http://127.0.0.1:3000'` is treated differently to `'http://127.0.0.1:3000/'`

#### `Access-Control-Allow-Credentials`

The [Access-Control-Allow-Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials) header allows client-side JavaScript running in the browser to send and receive credentials with requests - cookies, auth headers or TLS certificates.

For most applications this will not be necessary but if you require this to be set, see the example below for how to configure it.

##### Example

```json
{
  "API": {
    "HTTPHeaders": {
      "Access-Control-Allow-Credentials": true
    }
  }
}
```

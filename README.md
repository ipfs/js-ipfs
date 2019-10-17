<p align="center">
  <a href="https://js.ipfs.io" title="JS IPFS">
    <img src="https://ipfs.io/ipfs/Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh/js-ipfs-sticker.png" alt="IPFS in JavaScript logo" width="244" />
  </a>
</p>

<h3 align="center">The JavaScript implementation of the IPFS protocol.</h3>

<p align="center">
  <a href="http://protocol.ai"><img src="https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat" /></a>
  <a href="http://ipfs.io/"><img src="https://img.shields.io/badge/project-IPFS-blue.svg?style=flat" /></a>
</p>

<p align="center">
  <a href="https://riot.im/app/#/room/#ipfs-dev:matrix.org"><img src="https://img.shields.io/badge/matrix-%23ipfs%3Amatrix.org-blue.svg?style=flat" /> </a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat" /></a>
  <a href="https://discord.gg/24fmuwR"><img src="https://img.shields.io/discord/475789330380488707?color=blueviolet&label=discord&style=flat" /></a>
  <a href="https://github.com/ipfs/team-mgmt/blob/master/MGMT_JS_CORE_DEV.md"><img src="https://img.shields.io/badge/team-mgmt-blue.svg?style=flat" /></a>
</p>

<p align="center">
  <a href="https://github.com/ipfs/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg"></a>
  <a href="https://travis-ci.com/ipfs/js-ipfs"><img src="https://badgen.net/travis/ipfs/js-ipfs" /></a>
  <a href="https://codecov.io/gh/ipfs/js-ipfs"><img src="https://badgen.net/codecov/c/github/ipfs/js-ipfs" /></a>
  <a href="https://bundlephobia.com/result?p=ipfs"><img src="https://badgen.net/bundlephobia/minzip/ipfs"></a>
  <a href="https://david-dm.org/ipfs/js-ipfs"><img src="https://david-dm.org/ipfs/js-ipfs.svg?style=flat" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat"></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat" /></a>
  <br>
</p>

### Project status - `Alpha`

We've come a long way, but this project is still in Alpha, lots of development is happening, API might change, beware of the Dragons 🐉..

**Want to get started?** Check our [examples folder](/examples) to learn how to spawn an IPFS node in Node.js and in the Browser.

**Please read this:** The [DHT](https://en.wikipedia.org/wiki/Distributed_hash_table), a fundamental piece for automatic content and peer discovery is not yet complete. There are multiple applications that can be built without this service but nevertheless it is fundamental to getting that magic IPFS experience. The current status is that implementation is done and merged and we're working on performance issues. Expect the DHT to be available in a release very soon.

[**`Weekly Core Implementations Call`**](https://github.com/ipfs/team-mgmt/issues/992)

## Tech Lead

[David Dias](https://github.com/daviddias)

## Lead Maintainer

[Alan Shaw](https://github.com/alanshaw)

## Table of Contents

- [Tech Lead](#tech-lead)
- [Lead Maintainer](#lead-maintainer)
- [Table of Contents](#table-of-contents)
- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Through command line tool](#through-command-line-tool)
  - [Use in the browser](#use-in-the-browser)
- [Usage](#usage)
  - [IPFS CLI](#ipfs-cli)
  - [IPFS Daemon](#ipfs-daemon)
  - [IPFS Module](#ipfs-module)
  - [Tutorials and Examples](#tutorials-and-examples)
  - [API](#api)
    - [IPFS Constructor](#ipfs-constructor)
      - [`options.repo`](#optionsrepo)
      - [`options.init`](#optionsinit)
      - [`options.start`](#optionsstart)
      - [`options.pass`](#optionspass)
      - [`options.silent`](#optionssilent)
      - [`options.relay`](#optionsrelay)
      - [`options.preload`](#optionspreload)
      - [`options.EXPERIMENTAL`](#optionsexperimental)
      - [`options.config`](#optionsconfig)
        - [Configuring Delegate Routers](#configuring-delegate-routers)
      - [`options.ipld`](#optionsipld)
      - [`options.libp2p`](#optionslibp2p)
      - [`options.connectionManager`](#optionsconnectionmanager)
    - [Events](#events)
    - [`node.ready`](#nodeready)
    - [`node.start()`](#nodestart)
    - [`node.stop()`](#nodestop)
    - [Core API](#core-api)
    - [Files](#files)
    - [Graph](#graph)
    - [Block](#block)
    - [Name](#name)
    - [Crypto and Key Management](#crypto-and-key-management)
    - [Network](#network)
    - [Node Management](#node-management)
    - [Static types and utils](#static-types-and-utils)
- [FAQ](#faq)
    - [How to enable WebRTC support for js-ipfs in the Browser](#how-to-enable-webrtc-support-for-js-ipfs-in-the-browser)
    - [Is there WebRTC support for js-ipfs with Node.js?](#is-there-webrtc-support-for-js-ipfs-with-nodejs)
    - [How can I configure an IPFS node to use a custom `signaling endpoint` for my WebRTC transport?](#how-can-i-configure-an-ipfs-node-to-use-a-custom-signaling-endpoint-for-my-webrtc-transport)
    - [Is there a more stable alternative to webrtc-star that offers a similar functionality?](#is-there-a-more-stable-alternative-to-webrtc-star-that-offers-a-similar-functionality)
    - [I see some slowness when hopping between tabs Chrome with IPFS nodes, is there a reason why?](#i-see-some-slowness-when-hopping-between-tabs-chrome-with-ipfs-nodes-is-there-a-reason-why)
    - [Can I use IPFS in my Electron App?](#can-i-use-ipfs-in-my-electron-app)
    - [Have more questions?](#have-more-questions)
- [Running js-ipfs with Docker](#running-js-ipfs-with-docker)
- [Packages](#packages)
- [Development](#development)
  - [Clone and install dependencies](#clone-and-install-dependencies)
  - [Run tests](#run-tests)
  - [Run interop tests](#run-interop-tests)
  - [Run benchmark tests](#run-benchmark-tests)
  - [Lint](#lint)
  - [Build a dist version](#build-a-dist-version)
  - [Runtime Support](#runtime-support)
  - [Code Architecture and folder Structure](#code-architecture-and-folder-structure)
      - [Source code](#source-code)
  - [Monitoring](#monitoring)
  - [IPFS Architecture](#ipfs-architecture)
- [Contribute](#contribute)
  - [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Install

### npm

This project is available through [npm](https://www.npmjs.com/). To install, run:

```bash
> npm install ipfs
```

JS IPFS depends on native modules that are installed by [`node-gyp`](https://github.com/nodejs/node-gyp). If you have problems running the command above, it is likely that the [build tools required by `node-gyp`](https://github.com/nodejs/node-gyp#installation) are missing from your system. Please install them and then try again.

We support both the Current and Active LTS versions of Node.js. Please see [nodejs.org](https://nodejs.org/) for what these currently are.

This project is tested on macOS, Linux and Windows.

### Use in Node.js

To create an IPFS node programmatically:

```js
const IPFS = require('ipfs')
const node = await IPFS.create()

// Ready to use!
// See https://github.com/ipfs/js-ipfs#core-api
```

### Through command line tool

In order to use js-ipfs as a CLI, you must install it with the `global` flag. Run the following (even if you have ipfs installed locally):

```bash
npm install ipfs --global
```

The CLI is available by using the command `jsipfs` in your terminal. This is aliased, instead of using `ipfs`, to make sure it does not conflict with the [Go implementation](https://github.com/ipfs/go-ipfs).

### Use in the browser

Learn how to bundle with browserify and webpack in the [`examples`](https://github.com/ipfs/js-ipfs/tree/master/examples) folder.

You can also load it using a `<script>` using the [unpkg](https://unpkg.com) CDN **or** the [jsDelivr](https://www.jsdelivr.com/package/npm/ipfs) CDN. Inserting one of the following lines will make an `Ipfs` object available in the global namespace.

```html
<!-- loading the minified version using unpkg -->
<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version using unpkg -->
<script src="https://unpkg.com/ipfs/dist/index.js"></script>
```
**OR THIS:**

```html
<!-- loading the minified version using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.js"></script>
```

Inserting one of the above lines will make an `Ipfs` object available in the global namespace:

```html
<script>
async function main () {
  const node = await window.Ipfs.create()
  // Ready to use!
  // See https://github.com/ipfs/js-ipfs#core-api
}
main()
</script>
```

## Usage

### IPFS CLI

The `jsipfs` CLI, available when `js-ipfs` is installed globally, follows (should, it is a WIP) the same interface defined by `go-ipfs`, you can always use the `help` command for help menus.

```sh
# Install js-ipfs globally
> npm install ipfs --global
> jsipfs --help
Commands:
  bitswap               A set of commands to manipulate the bitswap agent.
  block                 Manipulate raw IPFS blocks.
  bootstrap             Show or edit the list of bootstrap peers.
  commands              List all available commands
  config <key> [value]  Get and set IPFS config values
  daemon                Start a long-running daemon process
# ...
```

`js-ipfs` uses some different default config values, so that they don't clash directly with a go-ipfs node running in the same machine. These are:

- default repo location: `~/.jsipfs` (can be changed with env variable `IPFS_PATH`)
- default swarm port: `4002`
- default API port: `5002`

### IPFS Daemon

The IPFS Daemon exposes the API defined in the [HTTP API spec`](https://docs.ipfs.io/reference/api/http/). You can use any of the IPFS HTTP-API client libraries with it, such as: [js-ipfs-http-client](https://github.com/ipfs/js-ipfs-http-client).

If you want a programmatic way to spawn a IPFS Daemon using JavaScript, check out [ipfsd-ctl module](https://github.com/ipfs/js-ipfsd-ctl)

### IPFS Module

Use the IPFS Module as a dependency of a project to __spawn in process instances of IPFS__. Create an instance by calling `await IPFS.create()`:

```js
// Create the IPFS node instance
const node = await IPFS.create()
// Your node is now ready to use \o/
await node.stop()
// node is now 'offline'
```

### [Tutorials and Examples](/examples)

You can find some examples and tutorials in the [examples](/examples) folder, these exist to help you get started using `js-ipfs`.

### API

#### IPFS Constructor

```js
const node = await IPFS.create([options])
```

Creates and returns a ready to use instance of an IPFS node.

<details><summary>Alternative method to construct an IPFS node</summary>

The recommended method of creating a new IPFS node is to use the `IPFS.create` method. However, IPFS is a `class`, and can also be constructed using the `new` keyword:

```js
const node = new IPFS([options])
```

At this point, your node has been created but is **not** ready to use. You must either attach a listener for the "ready" event _or_ wait for the `node.ready` promise to resolve:

```js
node.on('ready', () => { /* Node is now ready to use */ })
// OR
await node.ready
```
</details>

Use the `options` argument to specify advanced configuration. It is an object with any of these properties:

##### `options.repo`

| Type | Default |
|------|---------|
| string or [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo) instance | `'~/.jsipfs'` in Node.js, `'ipfs'` in browsers |

The file path at which to store the IPFS node’s data. Alternatively, you can set up a customized storage system by providing an [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo) instance.

Example:

```js
// Store data outside your user directory
const node = await IPFS.create({ repo: '/var/ipfs/data' })
```

##### `options.init`

| Type | Default |
|------|---------|
| boolean or object | `true` |

Initialize the repo when creating the IPFS node.

If you have already initialized a repo before creating your IPFS node (e.g. you are loading a repo that was saved to disk from a previous run of your program), you must make sure to set this to `false`. Note that *initializing* a repo is different from creating an instance of [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor sets many special properties when initializing a repo, so you should usually not try and call `repoInstance.init()` yourself.

Instead of a boolean, you may provide an object with custom initialization options. All properties are optional:

- `emptyRepo` (boolean) Whether to remove built-in assets, like the instructional tour and empty mutable file system, from the repo. (Default: `false`)
- `bits` (number) Number of bits to use in the generated key pair. (Default: `2048`)
- `privateKey` (string/PeerId) A pre-generated private key to use. Can be either a base64 string or a [PeerId](https://github.com/libp2p/js-peer-id) instance. **NOTE: This overrides `bits`.**
    ```js
    // Generating a Peer ID:
    const PeerId = require('peer-id')
    PeerId.create({ bits: 2048 }, (err, peerId) => {
      // Generates a new Peer ID, complete with public/private keypair
      // See https://github.com/libp2p/js-peer-id
    })
    ```
- `pass` (string) A passphrase to encrypt keys. You should generally use the [top-level `pass` option](#optionspass) instead of the `init.pass` option (this one will take its value from the top-level option if not set).
- `profiles` (Array) Apply profile settings to config.

##### `options.start`

| Type | Default |
|------|---------|
| boolean | `true` |

 If `false`, do not automatically start the IPFS node. Instead, you’ll need to manually call [`node.start()`](#nodestart) yourself.

##### `options.pass`

| Type | Default |
|------|---------|
| string | `null` |

A passphrase to encrypt/decrypt your keys.

##### `options.silent`

| Type | Default |
|------|---------|
| Boolean | `false` |

Prevents all logging output from the IPFS node.

##### `options.relay`

| Type | Default |
|------|---------|
| object | `{ enabled: true, hop: { enabled: false, active: false } }` |

Configure circuit relay (see the [circuit relay tutorial](https://github.com/ipfs/js-ipfs/tree/master/examples/circuit-relaying) to learn more).

- `enabled` (boolean): Enable circuit relay dialer and listener. (Default: `true`)
- `hop` (object)
    - `enabled` (boolean): Make this node a relay (other nodes can connect *through* it). (Default: `false`)
    - `active` (boolean): Make this an *active* relay node. Active relay nodes will attempt to dial a destination peer even if that peer is not yet connected to the relay. (Default: `false`)

##### `options.preload`

| Type | Default |
|------|---------|
| object | `{ enabled: true, addresses: [...] }` |

Configure remote preload nodes. The remote will preload content added on this node, and also attempt to preload objects requested by this node.

- `enabled` (boolean): Enable content preloading (Default: `true`)
- `addresses` (array): Multiaddr API addresses of nodes that should preload content. **NOTE:** nodes specified here should also be added to your node's bootstrap address list at [`config.Boostrap`](#optionsconfig).

##### `options.EXPERIMENTAL`

| Type | Default |
|------|---------|
| object | `{ ipnsPubsub: false, sharding: false }` |

Enable and configure experimental features.

- `ipnsPubsub` (boolean): Enable pub-sub on IPNS. (Default: `false`)
- `sharding` (boolean): Enable directory sharding. Directories that have many child objects will be represented by multiple DAG nodes instead of just one. It can improve lookup performance when a directory has several thousand files or more. (Default: `false`)

##### `options.config`

| Type | Default |
|------|---------|
| object |  [`config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime/config-nodejs.js) in Node.js, [`config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime/config-browser.js) in browsers |

Modify the default IPFS node config. This object will be *merged* with the default config; it will not replace it. The default config is documented in [the js-ipfs config file doc](doc/config.md).

###### Configuring Delegate Routers

If you need to support Delegated Content and/or Peer Routing, you can enable it by specifying the multiaddrs of your delegate nodes in the config via `options.config.Addresses.Delegates`. If you need to run a delegate router we encourage you to run your own, with go-ipfs. You can see instructions for doing so in the [delegated routing example](https://github.com/libp2p/js-libp2p/tree/master/examples/delegated-routing).

If you are not able to run your own delegate router nodes, we currently have two nodes that support delegated routing. **Important**: As many people may be leveraging these nodes, performance may be affected, which is why we recommend running your own nodes in production.

Available delegate multiaddrs are:
- `/dns4/node0.delegate.ipfs.io/tcp/443/https`
- `/dns4/node1.delegate.ipfs.io/tcp/443/https`

**Note**: If more than 1 delegate multiaddr is specified, the actual delegate will be randomly selected on startup.

##### `options.ipld`

 | Type | Default |
|------|---------|
| object |  [`ipld-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime/ipld-nodejs.js) in Node.js, [`ipld-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime/ipld-browser.js) in browsers |

 Modify the default IPLD config. This object will be *merged* with the default config; it will not replace it. Check IPLD [docs](https://github.com/ipld/js-ipld#ipld-constructor) for more information on the available options.

 > Browser config does **NOT** include by default all the IPLD formats. Only `ipld-dag-pb`, `ipld-dag-cbor` and `ipld-raw` are included.

 To add support for other formats we provide two options, one sync and another async.

 Examples for the sync option:

<details><summary>ESM Environments</summary>

```js
import ipldGit from 'ipld-git'
import ipldBitcoin from 'ipld-bitcoin'

const node = await IPFS.create({
  ipld: {
    formats: [ipldGit, ipldBitcoin]
  }
})
```
</details>
<details><summary>Commonjs Environments</summary>

```js
const node = await IPFS.create({
  ipld: {
    formats: [require('ipld-git'), require('ipld-bitcoin')]
  }
})
```
</details>
<details><summary>Using script tags</summary>

```html
<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>
<script src="https://unpkg.com/ipld-git/dist/index.min.js"></script>
<script src="https://unpkg.com/ipld-bitcoin/dist/index.min.js"></script>
<script>
async function main () {
  const node = await self.IPFS.create({
    ipld: {
      formats: [self.IpldGit, self.IpldBitcoin]
    }
  })
}
main()
</script>
```
</details>

 Examples for the async option:

<details><summary>ESM Environments</summary>

```js
const node = await IPFS.create({
  ipld: {
    async loadFormat (codec) {
      if (codec === multicodec.GIT_RAW) {
        return import('ipld-git') // This is a dynamic import
      } else {
        throw new Error('unable to load format ' + multicodec.print[codec])
      }
    }
  }
})
```
> For more information about dynamic imports please check [webpack docs](https://webpack.js.org/guides/code-splitting/#dynamic-imports) or search your bundler documention.

Using dynamic imports will tell your bundler to create a separate file (normally called *chunk*) that will **only** be requested by the browser if it's really needed. This strategy will reduce your bundle size and load times without removing any functionality.

With Webpack IPLD formats can even be grouped together using magic comments `import(/* webpackChunkName: "ipld-formats" */ 'ipld-git')` to produce a single file with all of them.
</details>

<details><summary>Commonjs Environments</summary>

```js
const node = await IPFS.create({
  ipld: {
    async loadFormat (codec) {
      if (codec === multicodec.GIT_RAW) {
        return require('ipld-git')
      } else {
        throw new Error('unable to load format ' + multicodec.print[codec])
      }
    }
  }
})
```
</details>

<details><summary>Using Script tags</summary>

```js
<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>
<script>
const load = (name, url) => new Promise((resolve, reject) => {
  const script = document.createElement('script')
  script.src = url
  script.onload = () => resolve(self[name])
  script.onerror = () => reject(new Error('Failed to load ' + url))
  document.body.appendChild(script)
})

const node = await self.IPFS.create({
  ipld: {
    async loadFormat (codec) {
      switch (codec) {
        case multicodec.GIT_RAW:
          return load('IpldGit', 'https://unpkg.com/ipld-git/dist/index.min.js')
        case multicodec.BITCOIN_BLOCK:
          return load('IpldBitcoin', 'https://unpkg.com/ipld-bitcoin/dist/index.min.js')
        default:
          throw new Error('Unable to load format ' + multicodec.print[codec])
      }
    }
  }
})
</script>
```
</details>


##### `options.libp2p`

| Type | Default |
|------|---------|
| object | [`libp2p-nodejs.js`](https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/libp2p-nodejs.js) in Node.js, [`libp2p-browser.js`](https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/libp2p-browser.js) in browsers |
| function | [`libp2p bundle`](examples/custom-libp2p) |

The libp2p option allows you to build your libp2p node by configuration, or via a bundle function. If you are looking to just modify the below options, using the object format is the quickest way to get the default features of libp2p. If you need to create a more customized libp2p node, such as with custom transports or peer/content routers that need some of the ipfs data on startup, a custom bundle is a great way to achieve this.

You can see the bundle in action in the [custom libp2p example](examples/custom-libp2p).

- `modules` (object):
    - `transport` (Array<[libp2p.Transport](https://github.com/libp2p/interface-transport)>): An array of Libp2p transport classes/instances to use _instead_ of the defaults. See [libp2p/interface-transport](https://github.com/libp2p/interface-transport) for details.
    - `peerDiscovery` (Array<[libp2p.PeerDiscovery](https://github.com/libp2p/interface-peer-discovery)>): An array of Libp2p peer discovery classes/instances to use _instead_ of the defaults. See [libp2p/peer-discovery](https://github.com/libp2p/interface-peer-discovery) for details. If passing a class, configuration can be passed using the config section below under the key corresponding to you module's unique `tag` (a static property on the class)
    - `dht` (object): a DHT implementation that enables PeerRouting and ContentRouting. Example [libp2p/js-libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
    - `pubsub` (object): a Pubsub implementation on top of [libp2p/js-libp2p-pubsub](https://github.com/libp2p/js-libp2p-pubsub)
- `config` (object):
    - `peerDiscovery` (object):
        - `autoDial` (boolean): Dial to discovered peers when under the Connection Manager min peer count watermark. (default `true`)
        - `[PeerDiscovery.tag]` (object): configuration for a peer discovery module
            - `enabled` (boolean): whether this module is enabled or disabled
            - `[custom config]` (any): other keys are specific to the module
    - `dht` (object): Configuration options for the DHT (WARNING: the current DHT implementation has performance issues, your mileage may vary)
        - `enabled` (boolean): whether the DHT is enabled or not (default `false`)
        - `kBucketSize` (number): bucket size (default `20`)
        - `randomWalk` (object): configuration for random walk
            - `enabled` (boolean): whether random DHT walking is enabled (default `false`)
    - `pubsub` (object): Configuration options for Pubsub
        - `enabled` (boolean): if pubbsub subsystem should be enabled (default: `false`)
        - `emitSelf` (boolean): whether the node should emit to self on publish, in the event of the topic being subscribed (default: `true`)
        - `signMessages` (boolean): if messages should be signed (default: `true`)
        - `strictSigning` (boolean): if message signing should be required (default: `true`)

##### `options.connectionManager`

| Type | Default |
|------|---------|
| object | [defaults](https://github.com/libp2p/js-libp2p-connection-manager#create-a-connectionmanager) |

Configure the libp2p connection manager.

#### Events

IPFS instances are Node.js [EventEmitters](https://nodejs.org/dist/latest-v8.x/docs/api/events.html#events_class_eventemitter). You can listen for events by calling `node.on('event', handler)`:

```js
const node = await IPFS.create({ repo: '/var/ipfs/data' })
node.on('error', errorObject => console.error(errorObject))
```

- `error` is always accompanied by an `Error` object with information about the error that occurred.

    ```js
    node.on('error', error => {
      console.error(error.message)
    })
    ```

- `init` is emitted after a new repo has been initialized. It will not be emitted if you set the `init: false` option on the constructor.

- `ready` is emitted when a node is ready to use. This is the final event you will receive when creating a node (after `init` and `start`).

    When creating a new IPFS node, you should almost always wait for the `ready` event before calling methods or interacting with the node.

- `start` is emitted when a node has started listening for connections. It will not be emitted if you set the `start: false` option on the constructor.

- `stop` is emitted when a node has closed all connections and released access to its repo. This is usually the result of calling [`node.stop()`](#nodestop).

#### `node.ready`

A promise that resolves when the node is ready to use. Should be used when constructing an IPFS node using `new`. You don't need to use this if you're using [`await IPFS.create`](#ipfs-constructor). e.g.

```js
const node = new IPFS()
await node.ready
// Ready to use!
```

#### `node.start()`

Start listening for connections with other IPFS nodes on the network. In most cases, you do not need to call this method — `IPFS.create()` will automatically do it for you.

This method is asynchronous and returns a promise.

```js
const node = await IPFS.create({ start: false })
console.log('Node is ready to use but not started!')

try {
  await node.start()
  console.log('Node started!')
} catch (error) {
  console.error('Node failed to start!', error)
}
```

<details><summary>Starting using callbacks and events</summary>

If you pass a function to this method, it will be called when the node is started (Note: this method will **not** return a promise if you use a callback function).

```js
// Note: you can use the class constructor style for more
// idiomatic callback/events style code
const node = new IPFS({ start: false })

node.on('ready', () => {
  console.log('Node is ready to use but not started!')

  node.start(error => {
    if (error) {
      return console.error('Node failed to start!', error)
    }
    console.log('Node started!')
  })
})
```

Alternatively you can listen for the [`start` event](#events):

```js
// Note: you can use the class constructor style for more
// idiomatic callback/events style code
const node = new IPFS({ start: false })

node.on('ready', () => {
  console.log('Node is ready to use but not started!')
  node.start()
})

node.on('error', error => {
  console.error('Something went terribly wrong!', error)
})

node.on('start', () => console.log('Node started!'))
```

</details>

#### `node.stop()`

Close and stop listening for connections with other IPFS nodes, then release access to the node’s repo.

This method is asynchronous and returns a promise.

```js
const node = await IPFS.create()
console.log('Node is ready to use!')

try {
  await node.stop()
  console.log('Node stopped!')
} catch (error) {
  console.error('Node failed to stop!', error)
}
```

<details><summary>Stopping using callbacks and events</summary>

If you pass a function to this method, it will be called when the node is stopped (Note: this method will **not** return a promise if you use a callback function).

```js
// Note: you can use the class constructor style for more
// idiomatic callback/events style code
const node = new IPFS()

node.on('ready', () => {
  console.log('Node is ready to use!')

  node.stop(error => {
    if (error) {
      return console.error('Node failed to stop cleanly!', error)
    }
    console.log('Node stopped!')
  })
})
```

Alternatively you can listen for the [`stop` event](#events).

```js
const node = new IPFS()

node.on('ready', () => {
  console.log('Node is ready to use!')
  node.stop()
})

node.on('error', error => {
  console.error('Something went terribly wrong!', error)
})

node.on('stop', () => console.log('Node stopped!'))
```
</details>

#### Core API

[![](https://github.com/ipfs/interface-ipfs-core/raw/master/img/badge.png)](https://github.com/ipfs/interface-ipfs-core)

The IPFS core API provides all functionality that is not specific to setting up and starting or stopping a node. This API is available directly on an IPFS instance, on the command line (when using the CLI interface), and as an HTTP REST API. For a complete reference, see [![](https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg)](https://github.com/ipfs/interface-ipfs-core).

All the API methods aside from streaming methods (ones that end in `ReadableStream` or `PullStream`) are asynchronous and return Promises, but _also_ accept callbacks.

The core API is grouped into several areas:

#### Files

- [Regular Files API](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md)
  - [`ipfs.add(data, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add)
  - [`ipfs.addPullStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addpullstream)
  - [`ipfs.addReadableStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addreadablestream)
  - [`ipfs.addFromStream(stream)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addfromstream)
  - [`ipfs.addFromFs(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addfromfs)
  - [`ipfs.addFromUrl(url, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addfromurl)
  - [`ipfs.cat(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#cat)
  - [`ipfs.catPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#catpullstream)
  - [`ipfs.catReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#catreadablestream)
  - [`ipfs.get(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#get)
  - [`ipfs.getPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#getpullstream)
  - [`ipfs.getReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#getreadablestream)
  - [`ipfs.ls(ipfsPath)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#ls)
  - [`ipfs.lsPullStream(ipfsPath)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#lspullstream)
  - [`ipfs.lsReadableStream(ipfsPath)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#lsreadablestream)
- [MFS (mutable file system) specific](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#mutable-file-system)
  - [`ipfs.files.cp([from, to])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filescp)
  - [`ipfs.files.flush([path])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesflush)
  - [`ipfs.files.ls([path], [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesls)
  - [`ipfs.files.mkdir(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesmkdir)
  - [`ipfs.files.mv([from, to])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesmv)
  - [`ipfs.files.read(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesread)
  - [`ipfs.files.readPullStream(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesreadpullstream)
  - [`ipfs.files.readReadableStream(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesreadreadablestream)
  - [`ipfs.files.rm(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesrm)
  - [`ipfs.files.stat(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesstat)
  - [`ipfs.files.write(path, content, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#fileswrite)


#### Graph

- [dag](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md)
  - [`ipfs.dag.put(dagNode, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md#dagput)
  - [`ipfs.dag.get(cid, [path], [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md#dagget)
  - [`ipfs.dag.tree(cid, [path], [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md#dagtree)

- [pin](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md)
  - [`ipfs.pin.add(hash, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md#pinadd)
  - [`ipfs.pin.ls([hash], [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md#pinls)
  - [`ipfs.pin.rm(hash, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md#pinrm)

- [object (legacy)](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md)
  - [`ipfs.object.new([template])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectnew)
  - [`ipfs.object.put(obj, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectput)
  - [`ipfs.object.get(multihash, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectget)
  - [`ipfs.object.data(multihash, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectdata)
  - [`ipfs.object.links(multihash, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectlinks)
  - [`ipfs.object.stat(multihash, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectstat)
  - [`ipfs.object.patch.addLink(multihash, DAGLink, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchaddlink)
  - [`ipfs.object.patch.rmLink(multihash, DAGLink, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchrmlink)
  - [`ipfs.object.patch.appendData(multihash, data, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchappenddata)
  - [`ipfs.object.patch.setData(multihash, data, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchsetdata)

#### Block

- [block](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md)
  - [`ipfs.block.get(cid, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#blockget)
  - [`ipfs.block.put(block, cid)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#blockput)
  - [`ipfs.block.rm(cid)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#blockrm)
  - [`ipfs.block.stat(cid)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#blockstat)
- [bitswap](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BITSWAP.md)
  - [`ipfs.bitswap.wantlist([peerId])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BITSWAP.md#bitswapwantlist)
  - [`ipfs.bitswap.stat()`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BITSWAP.md#bitswapstat)

#### Name

- [name](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md)
  - [`ipfs.name.publish(value, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepublish)
  - [`ipfs.name.pubsub.cancel(arg)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepubsubcancel)
  - [`ipfs.name.pubsub.state()`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepubsubstate)
  - [`ipfs.name.pubsub.subs()`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepubsubsubs)
  - [`ipfs.name.resolve(value, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#nameresolve)

#### Crypto and Key Management

- [key](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/KEY.md)
  - [`ipfs.key.export(name, password)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyexport)
  - [`ipfs.key.gen(name, options)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keygen)
  - [`ipfs.key.import(name, pem, password)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyimport)
  - [`ipfs.key.list()`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keylist)
  - [`ipfs.key.rename(oldName, newName)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyrename)
  - [`ipfs.key.rm(name)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyrm)

- crypto (not implemented yet)

#### Network

- [bootstrap](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BOOTSTRAP.md)
  - [`ipfs.bootstrap.list()`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BOOTSTRAP.md#bootstraplist)
  - [`ipfs.bootstrap.add(addr, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BOOTSTRAP.md#bootstrapadd)
  - [`ipfs.bootstrap.rm(peer, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BOOTSTRAP.md#bootstraprm)

- [dht](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DHT.md)
  - [`ipfs.dht.findPeer(peerId)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtfindpeer)
  - [`ipfs.dht.findProvs(multihash)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtfindprovs)
  - [`ipfs.dht.get(key)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtget)
  - [`ipfs.dht.provide(cid)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtprovide)
  - [`ipfs.dht.put(key, value)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtput)
  - [`ipfs.dht.query(peerId)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtquery)

- [pubsub](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md)
  - [`ipfs.pubsub.subscribe(topic, handler, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubsubscribe)
  - [`ipfs.pubsub.unsubscribe(topic, handler)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubunsubscribe)
  - [`ipfs.pubsub.publish(topic, data)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubpublish)
  - [`ipfs.pubsub.ls(topic)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubls)
  - [`ipfs.pubsub.peers(topic)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubpeers)

- [libp2p](https://github.com/libp2p/interface-libp2p). Every IPFS instance also exposes the libp2p SPEC at `ipfs.libp2p`. The formal interface for this SPEC hasn't been defined but you can find documentation at its implementations:
  - [Node.js bundle](./src/core/runtime/libp2p-nodejs.js)
  - [Browser Bundle](./src/core/runtime/libp2p-browser.js)
  - [libp2p baseclass](https://github.com/libp2p/js-libp2p)

- [swarm](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md)
  - [`ipfs.swarm.addrs()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#swarmaddrs)
  - [`ipfs.swarm.connect(addr)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#swarmconnect)
  - [`ipfs.swarm.disconnect(addr)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#swarmdisconnect)
  - [`ipfs.swarm.peers([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#swarmpeers)

#### Node Management

- [miscellaneous operations](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md)
  - [`ipfs.id()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#id)
  - [`ipfs.version()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#version)
  - [`ipfs.ping(peerId, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#ping)
  - [`ipfs.pingReadableStream(peerId, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#pingreadablestream)
  - [`ipfs.pingPullStream(peerId, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#pingpullstream)
  - `ipfs.init([options])`
  - `ipfs.start()`
  - [`ipfs.stop()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#stop)
  - `ipfs.isOnline()`
  - [`ipfs.resolve(name, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#resolve)
  - [`ipfs.dns(name, [options]`](https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#dns)

- [repo](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md)
  - `ipfs.repo.init`
  - [`ipfs.repo.stat([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md#repostat)
  - [`ipfs.repo.version()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md#repoversion)
  - [`ipfs.repo.gc([options])`](https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/REPO.md#repogc)

- [stats](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md)
  - [`ipfs.stats.bitswap()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#statsbitswap)
  - [`ipfs.stats.bw([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#statsbw)
  - [`ipfs.stats.bwPullStream([options]) -> Pull Stream`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#statsbwpullstream)
  - [`ipfs.stats.bwReadableStream([options]) -> Readable Stream`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#statsbwreadablestream)
  - [`ipfs.stats.repo([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#statsrepo)

- [config](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md)
  - [`ipfs.config.get([key])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configget)
  - [`ipfs.config.set(key, value)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configset)
  - [`ipfs.config.replace(config)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configreplace)
  - [`ipfs.config.profiles.list()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configprofileslist)
  - [`ipfs.config.profiles.apply(name, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configprofilesapply)

#### Static types and utils

Aside from the default export, `ipfs` exports various types and utilities that are included in the bundle:

- [`crypto`](https://www.npmjs.com/package/libp2p-crypto)
- [`isIPFS`](https://www.npmjs.com/package/is-ipfs)
- [`Buffer`](https://www.npmjs.com/package/buffer)
- [`PeerId`](https://www.npmjs.com/package/peer-id)
- [`PeerInfo`](https://www.npmjs.com/package/peer-info)
- [`multiaddr`](https://www.npmjs.com/package/multiaddr)
- [`multibase`](https://www.npmjs.com/package/multibase)
- [`multihash`](https://www.npmjs.com/package/multihashes)
- [`multihashing`](https://www.npmjs.com/package/multihashing-async)
- [`multicodec`](https://www.npmjs.com/package/multicodec)
- [`CID`](https://www.npmjs.com/package/cids)

These can be accessed like this, for example:

```js
const { CID } = require('ipfs')
// ...or from an es-module:
import { CID } from 'ipfs'
```

## FAQ

#### How to enable WebRTC support for js-ipfs in the Browser

To add a WebRTC transport to your js-ipfs node, you must add a WebRTC multiaddr. To do that, simple override the config.Addresses.Swarm array which contains all the multiaddrs which the IPFS node will use. See below:

```JavaScript
const node = await IPFS.create({
  config: {
    Addresses: {
      Swarm: [
        '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star'
      ]
    }
  }
})

// your instance with WebRTC is ready
```

**Important:** This transport usage is kind of unstable and several users have experienced crashes. Track development of a solution at https://github.com/ipfs/js-ipfs/issues/1088.

#### Is there WebRTC support for js-ipfs with Node.js?

Yes, however, bear in mind that there isn't a 100% stable solution to use WebRTC in Node.js, use it at your own risk. The most tested options are:

- [wrtc](https://npmjs.org/wrtc) - Follow the install instructions.
- [electron-webrtc](https://npmjs.org/electron-webrtc)

To add WebRTC support in a IPFS node instance, do:

```JavaScript
const wrtc = require('wrtc') // or require('electron-webrtc')()
const WStar = require('libp2p-webrtc-star')
const wstar = new WStar({ wrtc })

const node = await IPFS.create({
  repo: 'your-repo-path',
  // start: false,
  config: {
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4002",
        "/ip4/127.0.0.1/tcp/4003/ws",
        "/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star"
      ]
    }
  },
  libp2p: {
    modules: {
      transport: [wstar],
      peerDiscovery: [wstar.discovery]
    }
  }
})

// your instance with WebRTC is ready
```

To add WebRTC support to the IPFS daemon, you only need to install one of the WebRTC modules globally:

```bash
npm install wrtc --global
# or
npm install electron-webrtc --global
```

Then, update your IPFS Daemon config to include the multiaddr for this new transport on the `Addresses.Swarm` array. Add: `"/dns4/wrtc-star.discovery.libp2p.io/wss/p2p-webrtc-star"`

#### How can I configure an IPFS node to use a custom `signaling endpoint` for my WebRTC transport?

You'll need to execute a compatible `signaling server` ([libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star) works) and include the correct configuration param for your IPFS node:

- provide the [`multiaddr`](https://github.com/multiformats/multiaddr) for the `signaling server`

```JavaScript
const node = await IPFS.create({
  repo: 'your-repo-path',
  config: {
    Addresses: {
      Swarm: [
        '/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star'
      ]
    }
  }
})
```

The code above assumes you are running a local `signaling server` on port `9090`. Provide the correct values accordingly.

#### Is there a more stable alternative to webrtc-star that offers a similar functionality?

Yes, websocket-star! A WebSockets based transport that uses a Relay to route the messages. To enable it, just do:

```JavaScript
const node = await IPFS.create({
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
})

// your instance with websocket-star is ready
```

#### I see some slowness when hopping between tabs Chrome with IPFS nodes, is there a reason why?

Yes, unfortunately, due to [Chrome aggressive resource throttling policy](https://github.com/ipfs/js-ipfs/issues/611), it cuts freezes the execution of any background tab, turning an IPFS node that was running on that webpage into a vegetable state.

A way to mitigate this in Chrome, is to run your IPFS node inside a Service Worker, so that the IPFS instance runs in a background process. You can learn how to install an IPFS node as a service worker in here the repo [ipfs-service-worker](https://github.com/ipfs/ipfs-service-worker)

#### Can I use IPFS in my Electron App?

Yes you can and in many ways. Read https://github.com/ipfs/notes/issues/256 for the multiple options.

We now support Electron v5.0.0 without the need to rebuilt native modules.
Still if you run into problems with native modules follow these instructions [here](https://electronjs.org/docs/tutorial/using-native-node-modules).

#### Have more questions?

Ask for help in our forum at https://discuss.ipfs.io or in IRC (#ipfs on Freenode).

## Running js-ipfs with Docker

We have automatic Docker builds setup with Docker Hub: https://hub.docker.com/r/ipfs/js-ipfs/

All branches in the Github repository maps to a tag in Docker Hub, except `master` Git branch which is mapped to `latest` Docker tag.

You can run js-ipfs like this:

```
$ docker run -it -p 4002:4002 -p 4003:4003 -p 5002:5002 -p 9090:9090 ipfs/js-ipfs:latest

initializing ipfs node at /root/.jsipfs
generating 2048-bit RSA keypair...done
peer identity: Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
to get started, enter:

         jsipfs files cat /ipfs/QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr/readme

Initializing daemon...
Using wrtc for webrtc support
Swarm listening on /ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
Swarm listening on /ip4/172.17.0.2/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
Swarm listening on /ip4/127.0.0.1/tcp/4002/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
Swarm listening on /ip4/172.17.0.2/tcp/4002/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS
API is listening on: /ip4/0.0.0.0/tcp/5002
Gateway (readonly) is listening on: /ip4/0.0.0.0/tcp/9090
Daemon is ready

$ curl --silent localhost:5002/api/v0/id | jq .ID
"Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS"
```


## Packages

Listing of the main packages used in the IPFS ecosystem. There are also three specifications worth linking here:

- [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core)
- [`HTTP API spec`](https://docs.ipfs.io/reference/api/http)
- [`cli spec`](https://github.com/ipfs/specs/tree/master/public-api/cli)

> This table is generated using the module `package-table` with `package-table --data=package-list.json`.

| Package | Version | Deps | CI/Travis | Coverage | Lead Maintainer |
| ---------|---------|---------|---------|---------|--------- |
| **Files** |
| [`ipfs-unixfs-engine`](//github.com/ipfs/js-ipfs-unixfs-engine) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-engine.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs-engine/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs-engine.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs-engine) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-unixfs-engine.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-unixfs-engine) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-unixfs-engine) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-unixfs-exporter`](//github.com/ipfs/js-ipfs-unixfs-exporter) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-exporter.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs-exporter/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs-exporter.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs-exporter) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-unixfs-exporter.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-unixfs-exporter) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs-exporter/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-unixfs-exporter) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-unixfs-importer`](//github.com/ipfs/js-ipfs-unixfs-importer) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-importer.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs-importer/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs-importer.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs-importer) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-unixfs-importer.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-unixfs-importer) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs-importer/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-unixfs-importer) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-mfs`](//github.com/ipfs/js-ipfs-mfs) | [![npm](https://img.shields.io/npm/v/ipfs-mfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-mfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-mfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-mfs) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-mfs.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-mfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-mfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-mfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-unixfs`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-unixfs.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-unixfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| **Repo** |
| [`ipfs-repo`](//github.com/ipfs/js-ipfs-repo) | [![npm](https://img.shields.io/npm/v/ipfs-repo.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-repo.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-repo.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-repo) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-repo/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-repo) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| **Exchange** |
| [`ipfs-block-service`](//github.com/ipfs/js-ipfs-block-service) | [![npm](https://img.shields.io/npm/v/ipfs-block-service.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block-service/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-block-service.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-block-service) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-block-service/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-block-service) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipfs-block`](//github.com/ipfs/js-ipfs-block) | [![npm](https://img.shields.io/npm/v/ipfs-block.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-block.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-block.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-block) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-block/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-block) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipfs-bitswap`](//github.com/ipfs/js-ipfs-bitswap) | [![npm](https://img.shields.io/npm/v/ipfs-bitswap.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-bitswap/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-bitswap.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-bitswap) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-bitswap.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-bitswap) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-bitswap/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-bitswap) | [Dirk McCormick](mailto:dirk@protocol.ai) |
| **IPNS** |
| [`js-ipfs-name`](//github.com/ipfs/js-ipfs-name) | [![npm](https://img.shields.io/npm/v/js-ipfs-name.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-name/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-name.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-name) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-name.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-name) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-name/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-name) | N/A |
| **Generics/Utils** |
| [`ipfs-utils`](//github.com/ipfs/js-ipfs-utils) | [![npm](https://img.shields.io/npm/v/ipfs-utils.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-utils/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-utils.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-utils) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-utils.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-utils) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-utils) | [Hugo Dias](mailto:hugomrdias@gmail.com) |
| [`ipfs-http-client`](//github.com/ipfs/js-ipfs-http-client) | [![npm](https://img.shields.io/npm/v/ipfs-http-client.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-http-client/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-http-client.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-http-client) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-http-client.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-http-client) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-http-client/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-http-client) | [Alan Shaw](mailto:alan@tableflip.io) |
| [`ipfs-http-response`](//github.com/ipfs/js-ipfs-http-response) | [![npm](https://img.shields.io/npm/v/ipfs-http-response.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-http-response/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-http-response.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-http-response) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-http-response.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-http-response) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-http-response/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-http-response) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`ipfsd-ctl`](//github.com/ipfs/js-ipfsd-ctl) | [![npm](https://img.shields.io/npm/v/ipfsd-ctl.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfsd-ctl/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfsd-ctl.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfsd-ctl) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfsd-ctl.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfsd-ctl) | [![codecov](https://codecov.io/gh/ipfs/js-ipfsd-ctl/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfsd-ctl) | N/A |
| [`ipfs-multipart`](//github.com/ipfs/js-ipfs-multipart) | [![npm](https://img.shields.io/npm/v/ipfs-multipart.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-multipart/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-multipart.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-multipart) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-multipart.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-multipart) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-multipart/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-multipart) | [Hugo Dias](mailto:mail@hugodias.me) |
| [`is-ipfs`](//github.com/ipfs/is-ipfs) | [![npm](https://img.shields.io/npm/v/is-ipfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/is-ipfs/releases) | [![Deps](https://david-dm.org/ipfs/is-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/is-ipfs) | [![Travis CI](https://travis-ci.com/ipfs/is-ipfs.svg?branch=master)](https://travis-ci.com/ipfs/is-ipfs) | [![codecov](https://codecov.io/gh/ipfs/is-ipfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/is-ipfs) | [Marcin Rataj](mailto:lidel@lidel.org) |
| [`aegir`](//github.com/ipfs/aegir) | [![npm](https://img.shields.io/npm/v/aegir.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/aegir/releases) | [![Deps](https://david-dm.org/ipfs/aegir.svg?style=flat-square)](https://david-dm.org/ipfs/aegir) | [![Travis CI](https://travis-ci.com/ipfs/aegir.svg?branch=master)](https://travis-ci.com/ipfs/aegir) | [![codecov](https://codecov.io/gh/ipfs/aegir/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/aegir) | [Hugo Dias](mailto:hugomrdias@gmail.com) |
| [`ipfs-repo-migrations`](//github.com/ipfs/js-ipfs-repo-migrations) | [![npm](https://img.shields.io/npm/v/ipfs-repo-migrations.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo-migrations/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-repo-migrations.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo-migrations) | [![Travis CI](https://travis-ci.com/ipfs/js-ipfs-repo-migrations.svg?branch=master)](https://travis-ci.com/ipfs/js-ipfs-repo-migrations) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-repo-migrations/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-repo-migrations) | N/A |
| **libp2p** |
| [`libp2p`](//github.com/libp2p/js-libp2p) | [![npm](https://img.shields.io/npm/v/libp2p.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`peer-id`](//github.com/libp2p/js-peer-id) | [![npm](https://img.shields.io/npm/v/peer-id.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-id/releases) | [![Deps](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id) | [![Travis CI](https://travis-ci.com/libp2p/js-peer-id.svg?branch=master)](https://travis-ci.com/libp2p/js-peer-id) | [![codecov](https://codecov.io/gh/libp2p/js-peer-id/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-peer-id) | [Pedro Teixeira](mailto:i@pgte.me) |
| [`peer-info`](//github.com/libp2p/js-peer-info) | [![npm](https://img.shields.io/npm/v/peer-info.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-info/releases) | [![Deps](https://david-dm.org/libp2p/js-peer-info.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-info) | [![Travis CI](https://travis-ci.com/libp2p/js-peer-info.svg?branch=master)](https://travis-ci.com/libp2p/js-peer-info) | [![codecov](https://codecov.io/gh/libp2p/js-peer-info/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-peer-info) | [Pedro Teixeira](mailto:i@pgte.me) |
| [`libp2p-crypto`](//github.com/libp2p/js-libp2p-crypto) | [![npm](https://img.shields.io/npm/v/libp2p-crypto.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-crypto/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-crypto.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-crypto) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-crypto.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-crypto) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-crypto/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-crypto) | [Friedel Ziegelmayer](mailto:dignifiedquire@gmail.com) |
| [`libp2p-keychain`](//github.com/libp2p/js-libp2p-keychain) | [![npm](https://img.shields.io/npm/v/libp2p-keychain.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-keychain/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-keychain.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-keychain) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-keychain.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-keychain) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-keychain/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-keychain) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-circuit`](//github.com/libp2p/js-libp2p-circuit) | [![npm](https://img.shields.io/npm/v/libp2p-circuit.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-circuit/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-circuit.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-circuit) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-circuit.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-circuit) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-circuit/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-circuit) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-floodsub`](//github.com/libp2p/js-libp2p-floodsub) | [![npm](https://img.shields.io/npm/v/libp2p-floodsub.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-floodsub/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-floodsub.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-floodsub) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-floodsub.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-floodsub) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-floodsub/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-floodsub) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-kad-dht`](//github.com/libp2p/js-libp2p-kad-dht) | [![npm](https://img.shields.io/npm/v/libp2p-kad-dht.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-kad-dht/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-kad-dht.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-kad-dht) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-kad-dht.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-kad-dht) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-kad-dht/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-kad-dht) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-mdns`](//github.com/libp2p/js-libp2p-mdns) | [![npm](https://img.shields.io/npm/v/libp2p-mdns.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-mdns/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-mdns.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-mdns) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-mdns.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-mdns) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-mdns/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-mdns) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-bootstrap`](//github.com/libp2p/js-libp2p-bootstrap) | [![npm](https://img.shields.io/npm/v/libp2p-bootstrap.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-bootstrap/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-bootstrap.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-bootstrap) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-bootstrap.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-bootstrap) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-bootstrap/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-bootstrap) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-secio`](//github.com/libp2p/js-libp2p-secio) | [![npm](https://img.shields.io/npm/v/libp2p-secio.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-secio/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-secio.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-secio) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-secio.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-secio) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-secio/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-secio) | [Friedel Ziegelmayer](mailto:dignifiedquire@gmail.com) |
| [`libp2p-tcp`](//github.com/libp2p/js-libp2p-tcp) | [![npm](https://img.shields.io/npm/v/libp2p-tcp.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-tcp/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-tcp.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-tcp) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-tcp.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-tcp) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-tcp/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-tcp) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-webrtc-star`](//github.com/libp2p/js-libp2p-webrtc-star) | [![npm](https://img.shields.io/npm/v/libp2p-webrtc-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-webrtc-star/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-webrtc-star.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-webrtc-star) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-websocket-star`](//github.com/libp2p/js-libp2p-websocket-star) | [![npm](https://img.shields.io/npm/v/libp2p-websocket-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websocket-star/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-websocket-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websocket-star) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-websocket-star.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-websocket-star) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-websocket-star/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-websocket-star) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-websockets`](//github.com/libp2p/js-libp2p-websockets) | [![npm](https://img.shields.io/npm/v/libp2p-websockets.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websockets/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-websockets.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websockets) | [![Travis CI](https://travis-ci.com/libp2p/js-libp2p-websockets.svg?branch=master)](https://travis-ci.com/libp2p/js-libp2p-websockets) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-websockets/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-websockets) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`pull-mplex`](//github.com/libp2p/pull-mplex) | [![npm](https://img.shields.io/npm/v/pull-mplex.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/pull-mplex/releases) | [![Deps](https://david-dm.org/libp2p/pull-mplex.svg?style=flat-square)](https://david-dm.org/libp2p/pull-mplex) | [![Travis CI](https://travis-ci.com/libp2p/pull-mplex.svg?branch=master)](https://travis-ci.com/libp2p/pull-mplex) | [![codecov](https://codecov.io/gh/libp2p/pull-mplex/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/pull-mplex) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| **IPLD** |
| [`ipld`](//github.com/ipld/js-ipld) | [![npm](https://img.shields.io/npm/v/ipld.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld/releases) | [![Deps](https://david-dm.org/ipld/js-ipld.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld) | [![Travis CI](https://travis-ci.com/ipld/js-ipld.svg?branch=master)](https://travis-ci.com/ipld/js-ipld) | [![codecov](https://codecov.io/gh/ipld/js-ipld/branch/master/graph/badge.svg)](https://codecov.io/gh/ipld/js-ipld) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipld-dag-pb`](//github.com/ipld/js-ipld-dag-pb) | [![npm](https://img.shields.io/npm/v/ipld-dag-pb.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-pb/releases) | [![Deps](https://david-dm.org/ipld/js-ipld-dag-pb.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-pb) | [![Travis CI](https://travis-ci.com/ipld/js-ipld-dag-pb.svg?branch=master)](https://travis-ci.com/ipld/js-ipld-dag-pb) | [![codecov](https://codecov.io/gh/ipld/js-ipld-dag-pb/branch/master/graph/badge.svg)](https://codecov.io/gh/ipld/js-ipld-dag-pb) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipld-dag-cbor`](//github.com/ipld/js-ipld-dag-cbor) | [![npm](https://img.shields.io/npm/v/ipld-dag-cbor.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-cbor/releases) | [![Deps](https://david-dm.org/ipld/js-ipld-dag-cbor.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-cbor) | [![Travis CI](https://travis-ci.com/ipld/js-ipld-dag-cbor.svg?branch=master)](https://travis-ci.com/ipld/js-ipld-dag-cbor) | [![codecov](https://codecov.io/gh/ipld/js-ipld-dag-cbor/branch/master/graph/badge.svg)](https://codecov.io/gh/ipld/js-ipld-dag-cbor) | [Volker Mische](mailto:volker.mische@gmail.com) |
| **Multiformats** |
| [`multihashing`](//github.com/multiformats/js-multihashing) | [![npm](https://img.shields.io/npm/v/multihashing.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihashing/releases) | [![Deps](https://david-dm.org/multiformats/js-multihashing.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihashing) | [![Travis CI](https://travis-ci.com/multiformats/js-multihashing.svg?branch=master)](https://travis-ci.com/multiformats/js-multihashing) | [![codecov](https://codecov.io/gh/multiformats/js-multihashing/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-multihashing) | [Hugo Dias](mailto:mail@hugodias.me) |
| [`mafmt`](//github.com/multiformats/js-mafmt) | [![npm](https://img.shields.io/npm/v/mafmt.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-mafmt/releases) | [![Deps](https://david-dm.org/multiformats/js-mafmt.svg?style=flat-square)](https://david-dm.org/multiformats/js-mafmt) | [![Travis CI](https://travis-ci.com/multiformats/js-mafmt.svg?branch=master)](https://travis-ci.com/multiformats/js-mafmt) | [![codecov](https://codecov.io/gh/multiformats/js-mafmt/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-mafmt) | N/A |
| [`multiaddr`](//github.com/multiformats/js-multiaddr) | [![npm](https://img.shields.io/npm/v/multiaddr.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multiaddr/releases) | [![Deps](https://david-dm.org/multiformats/js-multiaddr.svg?style=flat-square)](https://david-dm.org/multiformats/js-multiaddr) | [![Travis CI](https://travis-ci.com/multiformats/js-multiaddr.svg?branch=master)](https://travis-ci.com/multiformats/js-multiaddr) | [![codecov](https://codecov.io/gh/multiformats/js-multiaddr/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-multiaddr) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`multihashes`](//github.com/multiformats/js-multihash) | [![npm](https://img.shields.io/npm/v/multihashes.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihash/releases) | [![Deps](https://david-dm.org/multiformats/js-multihash.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihash) | [![Travis CI](https://travis-ci.com/multiformats/js-multihash.svg?branch=master)](https://travis-ci.com/multiformats/js-multihash) | [![codecov](https://codecov.io/gh/multiformats/js-multihash/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-multihash) | [David Dias](mailto:daviddias@ipfs.io) |

## Development

### Clone and install dependencies

```sh
> git clone https://github.com/ipfs/js-ipfs.git
> cd js-ipfs
> npm install
```

### Run tests

```sh
# run all the unit tests
> npm test

# run individual tests (findprovs)
> npm run test -- --grep findprovs

# run just IPFS tests in Node.js
> npm run test:node

# run just IPFS core tests
> npm run test:node:core

# run just IPFS HTTP-API tests
> npm run test:node:http

# run just IPFS CLI tests
> npm run test:node:cli

# run just IPFS core tests in the Browser (Chrome)
> npm run test:browser

# run some interface tests (block API) on Node.js
> npm run test:node:interface -- --grep '.block'
```

### Run interop tests


```sh
# run the interop tests with the default go-IPFS
> npm run test:interop

# run the interop tests with a different go-IPFS
> IPFS_EXEC_GO=/path/to/ipfs npm run test:interop
```

### Run benchmark tests

```sh
# run all the benchmark tests
> npm run benchmark

# run just IPFS benchmarks in Node.js
> npm run benchmark:node

# run just IPFS benchmarks in Node.js for an IPFS instance
> npm run benchmark:node:core

# run just IPFS benchmarks in Node.js for an IPFS daemon
> npm run benchmark:node:http

# run just IPFS benchmarks in the browser (Chrome)
> npm run benchmark:browser
```

### Lint

**Conforming to linting rules is a prerequisite to commit to js-ipfs.**

```sh
> npm run lint
```

### Build a dist version

```sh
> npm run build
```

### [Runtime Support](https://github.com/ipfs/js-ipfs/issues/536)

### Code Architecture and folder Structure

![](/img/overview.png)

##### Source code

```Bash
> tree src -L 2
src                 # Main source code folder
├── cli             # Implementation of the IPFS CLI
│   └── ...
├── http            # The HTTP-API implementation of IPFS as defined by HTTP API spec
├── core            # IPFS implementation, the core (what gets loaded in browser)
│   ├── components  # Each of IPFS subcomponent
│   └── ...
└── ...
```

### Monitoring

The HTTP API exposed with js-ipfs can also be used for exposing metrics about
the running js-ipfs node and other Node.js metrics.

To enable it, you need to set the environment variable `IPFS_MONITORING` (any value)

Once the environment variable is set and the js-ipfs daemon is running, you can get
the metrics (in prometheus format) by making a GET request to the following endpoint:

```
http://localhost:5002/debug/metrics/prometheus
```

### IPFS Architecture

![](/img/architecture.png)

[Annotated version](https://user-images.githubusercontent.com/1211152/47606420-b6265780-da13-11e8-923b-b365a8534e0e.png)j

What does this image explain?

- IPFS uses `ipfs-repo` which picks `fs` or `indexeddb` as its storage drivers, depending if it is running in Node.js or in the Browser.
- The exchange protocol, `bitswap`, uses the Block Service which in turn uses the Repo, offering a get and put of blocks to the IPFS implementation.
- The DAG API (previously Object) comes from the IPLD Resolver, it can support several IPLD Formats (i.e: dag-pb, dag-cbor, etc).
- The Files API uses `ipfs-unixfs-engine` to import and export files to and from IPFS.
- libp2p, the network stack of IPFS, uses libp2p to dial and listen for connections, to use the DHT, for discovery mechanisms, and more.

## Contribute

IPFS implementation in JavaScript is a work in progress. As such, there's a few things you can do right now to help out:

- Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrastructure behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
- **Perform code reviews**. More eyes will help (a) speed the project along, (b) ensure quality, and (c) reduce possible future bugs.
- Take a look at go-ipfs and some of the planning repositories or issues: for instance, the [libp2p spec](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
- **Add tests**. There can never be enough tests.

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)

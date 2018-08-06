<h1 align="center">
  <a href="https://ipfs.io">
    <img src="https://ipfs.io/ipfs/QmVk7srrwahXLNmcDYvyUEJptyoxpndnRa57YJ11L4jV26/ipfs.js.png" alt="IPFS in JavaScript logo" />
  </a>
</h1>

<h3 align="center">The JavaScript implementation of the IPFS protocol.</h3>

<p align="center">
  <a href="http://ipn.io"><img src="https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square" /></a>
  <a href="http://ipfs.io/"><img src="https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square" /></a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square" /></a>
  <br> <a href="https://waffle.io/ipfs/js-ipfs"><img src="https://img.shields.io/badge/pm-waffle-blue.svg?style=flat-square" /></a>
  <a href="https://github.com/ipfs/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg"></a>
  <a href="https://github.com/ipfs/interface-ipfs-core/issues/55"><img src="https://img.shields.io/badge/interface--ipfs--core-Updates-blue.svg"></a>
</p>

<p align="center">
    <a href="https://ci.ipfs.team/job/ipfs/job/js-ipfs-unixfs-engine/job/master/"><img src="https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-unixfs-engine/master" /></a>
  <a href="https://codecov.io/gh/ipfs/js-ipfs"><img src="https://codecov.io/gh/ipfs/js-ipfs/branch/master/graph/badge.svg" /></a>
  <a href="https://david-dm.org/ipfs/js-ipfs"><img src="https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D5.0.0-orange.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D8.0.0-orange.svg?style=flat-square" /></a>
  <br>
</p>

### Project status

We've come a long way, but this project is still in Alpha, lots of development is happening, API might change, beware of the Dragons 🐉..

**Want to get started?** Check our [examples folder](/examples) to learn how to spawn an IPFS node in Node.js and in the Browser.

You can check the development status at the [Waffle Board](https://waffle.io/ipfs/js-ipfs).

[![Throughput Graph](https://graphs.waffle.io/ipfs/js-ipfs/throughput.svg)](https://waffle.io/ipfs/js-ipfs/metrics/throughput)

**Please read this:** DHT (automatic content discovery) and Circuit Relay (pierce through NATs and dial between any node in the network) are two fundamental pieces that are not finalized yet. There are multiple applications that can be built without these two services but nevertheless they are fundamental to get that magic IPFS experience. If you want to track progress or contribute, please follow:

- DHT: https://github.com/ipfs/js-ipfs/pull/856
- ✅ Relay: https://github.com/ipfs/js-ipfs/pull/1063

[**`Weekly Core Dev Calls`**](https://github.com/ipfs/pm/issues/650)

## Tech Lead

[David Dias](https://github.com/diasdavid)

## Lead Maintainer

[Alan Shaw](https://github.com/alanshaw)

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Through command line tool](#through-command-line-tool)
  - [Use in the browser](#use-in-the-browser)
- [Usage](#usage)
  - [IPFS CLI](#ipfs-cli)
  - [IPFS Daemon](#ipfs-daemon)
  - [IPFS Module (use IPFS as a module in Node.js or in the Browser)](#ipfs-module)
  - [Tutorials and Examples](#tutorials-and-examples)
  - [API Docs](#api)
    - [Constructor](#ipfs-constructor)
    - [Events](#events)
    - [start](#nodestartcallback)
    - [stop](#nodestopcallback)
    - [Core API](#core-api)
      - [Files](#files)
      - [Graph](#graph)
      - [Crypto and Key Management](#crypto-and-key-management)
      - [Network](#network)
      - [Node Management](#node-management)
      - [Domain data types](#domain-data-types)
      - [Util](#util)
- [FAQ](#faq)
- [Running js-ipfs with Docker](#running-js-ipfs-with-docker)
- [Packages](#packages)
- [Development](#development)
  - [Clone and install dependencies](#clone-and-install-dependencies)
  - [Run Tests](#run-unit-tests)
  - [Lint](#lint)
  - [Build a dist version](#build-a-dist-version)
- [Contribute](#contribute)
  - [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Install

### npm

This project is available through [npm](https://www.npmjs.com/). To install run

```bash
> npm install ipfs --save
```

Requires npm@3 and node@6 or above, tested on OSX & Linux, expected to work on Windows.

### Use in Node.js

To include this project programmatically:

```JavaScript
const IPFS = require('ipfs')
const node = new IPFS()
```

### Through command line tool

In order to use js-ipfs as a CLI, you must install it with the `global` flag. Run the following (even if you have ipfs installed locally):

```bash
> npm install ipfs --global
```

The CLI is available by using the command `jsipfs` in your terminal. This is aliased, instead of using `ipfs`, to make sure it does not conflict with the [Go implementation](https://github.com/ipfs/go-ipfs).

### Use in the browser

Learn how to bundle with browserify and webpack in the [`examples`](https://github.com/ipfs/js-ipfs/tree/master/examples) folder.


You can also load it using a `<script>` using the [unpkg](https://unpkg.com) CDN or the [jsDelivr](https://www.jsdelivr.com/package/npm/ipfs) CDN. Inserting one of the following lines will make a `Ipfs` object available in the global namespace.

```html
<!-- loading the minified version -->
<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version -->
<script src="https://unpkg.com/ipfs/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.js"></script>
```
Inserting one of the above lines will make an `Ipfs` object available in the global namespace.

## Usage

### IPFS CLI

The `jsipfs` CLI, available when `js-ipfs` is installed globally, follows(should, it is a WIP) the same interface defined by `go-ipfs`, you can always use the `help` command for help menus.

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
- default Bootstrap is off, to enable it set `IPFS_BOOTSTRAP=1`


### IPFS Daemon

The IPFS Daemon exposes the API defined [`http-api-spec`](https://github.com/ipfs/http-api-spec). You can use any of the IPFS HTTP-API client libraries with it, such as: [js-ipfs-api](https://github.com/ipfs/js-ipfs-api).

If you want a programmatic way to spawn a IPFS Daemon using JavaScript, check out [ipfsd-ctl module](https://github.com/ipfs/js-ipfsd-ctl)

### IPFS Module

Use the IPFS Module as a dependency of a project to __spawn in process instances of IPFS__. Create an instance by calling `new IPFS()` and waiting for its `ready` event:

```JavaScript
// Create the IPFS node instance
const node = new IPFS()

node.on('ready', () => {
  // Your node is now ready to use \o/

  // stopping a node
  node.stop(() => {
    // node is now 'offline'
  })
})
```

### [Tutorials and Examples](/examples)

You can find some examples and tutorials in the [examples](/examples) folder, these exist to help you get started using `js-ipfs`.

### API

#### IPFS Constructor

```js
const node = new IPFS([options])
```

Creates and returns an instance of an IPFS node. Use the `options` argument to specify advanced configuration. It is an object with any of these properties:

- `repo` (string or [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo) instance): The file path at which to store the IPFS node’s data. Alternatively, you can set up a customized storage system by providing an [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo) instance. (Default: `'~/.jsipfs'` in Node.js, `'ipfs'` in browsers.)

    Example:

    ```js
    // Store data outside your user directory
    const node = new IPFS({ repo: '/var/ipfs/data' })
    ```

- `init` (boolean or object): Initialize the repo when creating the IPFS node. (Default: `true`)

    If you have already initialized a repo before creating your IPFS node (e.g. you are loading a repo that was saved to disk from a previous run of your program), you must make sure to set this to `false`. Note that *initializing* a repo is different from creating an instance of [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor sets many special properties when initializing a repo, so you should usually not try and call `repoInstance.init()` yourself.

    Instead of a boolean, you may provide an object with custom initialization options. All properties are optional:

    - `init.emptyRepo` (boolean) Whether to remove built-in assets, like the instructional tour and empty mutable file system, from the repo. (Default: `false`)
    - `init.bits` (number) Number of bits to use in the generated key pair. (Default: `2048`)
    - `init.pass` (string) A passphrase to encrypt keys. You should generally use the top-level `pass` option instead of the `init.pass` option (this one will take its value from the top-level option if not set).

- `start` (boolean): If `false`, do not automatically start the IPFS node. Instead, you’ll need to manually call `node.start()` yourself. (Default: `true`)

- `pass` (string): A passphrase to encrypt/decrypt your keys.

- `relay` (object): Configure circuit relay (see the [circuit relay tutorial](https://github.com/ipfs/js-ipfs/tree/master/examples/circuit-relaying) to learn more).
    - `enabled` (boolean): Enable circuit relay dialer and listener. (Default: `false`)
    - `hop` (object)
        - `enabled` (boolean): Make this node a relay (other nodes can connect *through* it). (Default: `false`)
        - `active` (boolean): Make this an *active* relay node. Active relay nodes will attempt to dial a destination peer even if that peer is not yet connected to the relay. (Default: `false`)

- `preload` (object): Configure external nodes that will preload content added to this node
    - `enabled` (boolean): Enable content preloading (Default: `true`)
    - `addresses` (array): Multiaddr API addresses of nodes that should preload content. NOTE: nodes specified here should also be added to your node's bootstrap address list at `config.Boostrap`
- `EXPERIMENTAL` (object): Enable and configure experimental features.
    - `pubsub` (boolean): Enable libp2p pub-sub. (Default: `false`)
    - `sharding` (boolean): Enable directory sharding. Directories that have many child objects will be represented by multiple DAG nodes instead of just one. It can improve lookup performance when a directory has several thousand files or more. (Default: `false`)
    - `dht` (boolean): Enable KadDHT. **This is currently not interopable with `go-ipfs`.**

- `config` (object) Modify the default IPFS node config. Find the Node.js defaults at [`src/core/runtime/config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime/config-nodejs.js) and the browser defaults at [`src/core/runtime/config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime/config-browser.js). This object will be *merged* with the default config; it will not replace it.

- `libp2p` (object) add custom modules to the libp2p stack of your node
    - `modules` (object):
        - `transport` (Array<[libp2p.Transport](https://github.com/libp2p/interface-transport)>): An array of Libp2p transport classes/instances to use _instead_ of the defaults. See [libp2p/interface-transport](https://github.com/libp2p/interface-transport) for details.
        - `peerDiscovery` (Array<[libp2p.PeerDiscovery](https://github.com/libp2p/interface-peer-discovery)>): An array of Libp2p peer discovery classes/instances to use _instead_ of the defaults. See [libp2p/peer-discovery](https://github.com/libp2p/interface-peer-discovery) for details. If passing a class, configuration can be passed using the config section below under the key corresponding to you module's unique `tag` (a static property on the class)
    - `config` (object):
        - `peerDiscovery` (object):
            - `[PeerDiscovery.tag]` (object): configuration for a peer discovery module
                - `enabled` (boolean): whether this module is enabled or disabled
                - `[custom config]` (any): other keys are specific to the module

- `connectionManager` (object): Configure the libp2p connection manager, see the [documentation for available options](https://github.com/libp2p/js-libp2p-connection-manager#create-a-connectionmanager).

#### Events

IPFS instances are Node.js [EventEmitters](https://nodejs.org/dist/latest-v8.x/docs/api/events.html#events_class_eventemitter). You can listen for events by calling `node.on('event', handler)`:

```js
const node = new IPFS({ repo: '/var/ipfs/data' })
node.on('error', errorObject => console.error(errorObject))
```

- `error` is always accompanied by an `Error` object with information about the error that ocurred.

    ```js
    node.on('error', error => {
      console.error(error.message)
    })
    ```

- `init` is emitted after a new repo has been initialized. It will not be emitted if you set the `init: false` option on the constructor.

- `ready` is emitted when a node is ready to use. This is the final event you will receive when creating a node (after `init` and `start`).

    When creating a new IPFS node, you should almost always wait for the `ready` event before calling methods or interacting with the node.

- `start` is emitted when a node has started listening for connections. It will not be emitted if you set the `start: false` option on the constructor.

- `stop` is emitted when a node has closed all connections and released access to its repo. This is usually the result of calling [`node.stop()`](#nodestopcallback).

#### `node.start([callback])`

Start listening for connections with other IPFS nodes on the network. In most cases, you do not need to call this method — `new IPFS()` will automatically do it for you.

This method is asynchronous. There are several ways to be notified when the node has finished starting:

1. If you call `node.start()` with no arguments, it returns a promise.
2. If you pass a function as the final argument, it will be called when the node is started. *(Note: this method will **not** return a promise if you use a callback function.)*
3. You can listen for the [`start` event](#events).

```js
const node = new IPFS({ start: false })

// Use a promise:
node.start()
  .then(() => console.log('Node started!'))
  .catch(error => console.error('Node failed to start!', error))

// OR use a callback:
node.start(error => {
  if (error) {
    console.error('Node failed to start!', error)
    return
  }
  console.log('Node started!')
})

// OR use events:
node.on('error', error => console.error('Something went terribly wrong!', error))
node.on('start', () => console.log('Node started!'))
node.start()
```

#### `node.stop([callback])`

Close and stop listening for connections with other IPFS nodes, then release access to the node’s repo.

This method is asynchronous. There are several ways to be notified when the node has completely stopped:

1. If you call `node.stop()` with no arguments, it returns a promise.
2. If you pass a function as the final argument, it will be called when the node is stopped. *(Note: this method will **not** return a promise if you use a callback function.)*
3. You can listen for the [`stop` event](#events).

```js
const node = new IPFS()
node.on('ready', () => {
  console.log('Node is ready to use!')

  // Stop with a promise:
  node.stop()
    .then(() => console.log('Node stopped!'))
    .catch(error => console.error('Node failed to stop cleanly!', error))

  // OR use a callback:
  node.stop(error => {
    if (error) {
      console.error('Node failed to stop cleanly!', error)
      return
    }
    console.log('Node stopped!')
  })

  // OR use events:
  node.on('error', error => console.error('Something went terribly wrong!', error))
  node.stop()
})
```

#### Core API

[![](https://github.com/ipfs/interface-ipfs-core/raw/master/img/badge.png)](https://github.com/ipfs/interface-ipfs-core)

The IPFS core API provides all functionality that is not specific to setting up and starting or stopping a node. This API is available directly on an IPFS instance, on the command line (when using the CLI interface), and as an HTTP REST API. For a complete reference, see [![](https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg)](https://github.com/ipfs/interface-ipfs-core).

The core API is grouped into several areas:

#### `Files`

- [files](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md)
  - [`ipfs.files.add(data, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesadd). Alias to `ipfs.add`.
  - [`ipfs.files.addPullStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesaddpullstream)
  - [`ipfs.files.addReadableStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesaddreadablestream)
  - [`ipfs.files.cat(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filescat). Alias to `ipfs.cat`.
  - [`ipfs.files.catPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filescatpullstream)  
  - [`ipfs.files.catReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filescatreadablestream)
  - [`ipfs.files.get(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesget). Alias to `ipfs.get`.
  - [`ipfs.files.getPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesgetpullstream)  
  - [`ipfs.files.getReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesgetreadablestream)
  - [`ipfs.ls(ipfsPath, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#ls)
  - [`ipfs.lsPullStream(ipfsPath)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#lspullstream)
  - [`ipfs.lsReadableStream(ipfsPath)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#lsreadablestream)
  - [MFS (mutable file system) specific](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#mutable-file-system)
    - [`ipfs.files.cp([from, to], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filescp)
    - [`ipfs.files.flush([path], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesflush)
    - [`ipfs.files.ls([path], [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesls)
    - [`ipfs.files.mkdir(path, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesmkdir)
    - [`ipfs.files.mv([from, to], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesmv)
    - [`ipfs.files.read(path, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesread)
    - [`ipfs.files.readPullStream(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesreadpullstream)
    - [`ipfs.files.readReadableStream(path, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesreadreadablestream)
    - [`ipfs.files.rm(path, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesrm)
    - [`ipfs.files.stat(path, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesstat)
    - [`ipfs.files.write(path, content, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#fileswrite)

- [block](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md)
  - [`ipfs.block.get(cid, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#get)
  - [`ipfs.block.put(block, cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#put)
  - [`ipfs.block.stat(cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#stat)

#### `Graph`

- [dag](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md)
  - [`ipfs.dag.put(dagNode, options, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md#dagput)
  - [`ipfs.dag.get(cid [, path, options], callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md#dagget)
  - [`ipfs.dag.tree(cid [, path, options], callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md#dagtree)

- [object](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md).
  - [`ipfs.object.new([template][, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectnew)
  - [`ipfs.object.put(obj, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectput)
  - [`ipfs.object.get(multihash, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectget)
  - [`ipfs.object.data(multihash, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectdata)
  - [`ipfs.object.links(multihash, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectlinks)
  - [`ipfs.object.stat(multihash, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectstat)
  - [`ipfs.object.patch.addLink(multihash, DAGLink, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchaddlink)
  - [`ipfs.object.patch.rmLink(multihash, DAGLink, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchrmlink)
  - [`ipfs.object.patch.appendData(multihash, data, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchappenddata)
  - [`ipfs.object.patch.setData(multihash, data, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/OBJECT.md#objectpatchsetdata)
- [pin (not implemented, yet!)](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)

#### `Crypto and Key Management`

- [key](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/KEY.md)
  - `ipfs.key.export(name, password, [callback])`
  - `ipfs.key.gen(name, options, [callback])`
  - `ipfs.key.import(name, pem, password, [callback])`
  - `ipfs.key.list([callback])`
  - `ipfs.key.rename(oldName, newName, [callback])`
  - `ipfs.key.rm(name, [callback])`
- [crypto (not yet implemented)](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC)

#### `Network`

- [bootstrap](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)
  - `ipfs.bootstrap.list`
  - `ipfs.bootstrap.add`
  - `ipfs.bootstrap.rm`

- [bitswap](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)
  - `ipfs.bitswap.wantlist()`
  - `ipfs.bitswap.stat()`
  - `ipfs.bitswap.unwant()`

- [dht (not implemented, yet!)](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)

- [pubsub](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md)
  - [`ipfs.pubsub.subscribe(topic, handler, options, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubsubscribe)
  - [`ipfs.pubsub.unsubscribe(topic, handler, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubunsubscribe)
  - [`ipfs.pubsub.publish(topic, data, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubpublish)
  - [`ipfs.pubsub.ls(topic, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubls)
  - [`ipfs.pubsub.peers(topic, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubpeers)

- [libp2p](https://github.com/libp2p/interface-libp2p). Every IPFS instance also exposes the libp2p SPEC at `ipfs.libp2p`. The formal interface for this SPEC hasn't been defined by you can find documentation at its implementations:
  - [Node.js bundle](./src/core/runtime/libp2p-nodejs.js)
  - [Browser Bundle](./src/core/runtime/libp2p-browser.js)
  - [libp2p baseclass](https://github.com/libp2p/js-libp2p)

- [swarm](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md)
  - [`ipfs.swarm.addrs([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#addrs)
  - [`ipfs.swarm.connect(addr, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#connect)
  - [`ipfs.swarm.disconnect(addr, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#disconnect)
  - [`ipfs.swarm.peers([opts] [, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#peers)

#### `Node Management`

- [miscellaneous operations](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md)
  - [`ipfs.id([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#id)
  - [`ipfs.version([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#version)
  - `ipfs.ping()`
  - `ipfs.init([options], callback)`
  - `ipfs.start([callback])`
  - [`ipfs.stop([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#stop)
  - `ipfs.isOnline()`

- [repo](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md)
  - `ipfs.repo.init`
  - [`ipfs.repo.stat([options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md#stat)
  - [`ipfs.repo.version([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md#version)
  - `ipfs.repo.gc([options, callback])` (not implemented, yet!)

- [stats](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md)
  - [`ipfs.stats.bitswap([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#bitswap)
  - [`ipfs.stats.bw([options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#bw)
  - [`ipfs.stats.bwPullStream([options]) -> Pull Stream`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#bwpullstream)
  - [`ipfs.stats.bwReadableStream([options]) -> Readable Stream`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#bwreadablestream)
  - [`ipfs.stats.repo([options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#repo)

- [config](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md)
  - [`ipfs.config.get([key, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configget)
  - [`ipfs.config.set(key, value, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configset)
  - [`ipfs.config.replace(config, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configreplace)

#### `Domain data types`

A set of data types are exposed directly from the IPFS instance under `ipfs.types`. That way you're not required to import/require the following.

- [`ipfs.types.Buffer`](https://www.npmjs.com/package/buffer)
- [`ipfs.types.PeerId`](https://github.com/libp2p/js-peer-id)
- [`ipfs.types.PeerInfo`](https://github.com/libp2p/js-peer-info)
- [`ipfs.types.multiaddr`](https://github.com/multiformats/js-multiaddr)
- [`ipfs.types.multibase`](https://github.com/multiformats/multibase)
- [`ipfs.types.multihash`](https://github.com/multiformats/js-multihash)
- [`ipfs.types.CID`](https://github.com/ipld/js-cid)
- [`ipfs.types.dagPB`](https://github.com/ipld/js-ipld-dag-pb)
- [`ipfs.types.dagCBOR`](https://github.com/ipld/js-ipld-dag-cbor)

#### `Util`

A set of utils are exposed directly from the IPFS instance under `ipfs.util`. That way you're not required to import/require the following:

- [`ipfs.util.crypto`](https://github.com/libp2p/js-libp2p-crypto)
- [`ipfs.util.isIPFS`](https://github.com/ipfs-shipyard/is-ipfs)

## FAQ

#### How to enable WebRTC support for js-ipfs in the Browser

To add a WebRTC transport to your js-ipfs node, you must add a WebRTC multiaddr. To do that, simple override the config.Addresses.Swarm array which contains all the multiaddrs which the IPFS node will use. See below:

```JavaScript
const node = new IPFS({
  config: {
    Addresses: {
      Swarm: [
        '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star'
      ]
    }
  }
})

node.on('ready', () => {
  // your instance with WebRTC is ready
})
```

**Important:** This transport usage is kind of unstable and several users have experienced crashes. Track development of a solution at https://github.com/ipfs/js-ipfs/issues/1088.

#### Is there WebRTC support for js-ipfs with Node.js?

Yes, however, bare in mind that there isn't a 100% stable solution to use WebRTC in Node.js, use it at your own risk. The most tested options are:

- [wrtc](https://npmjs.org/wrtc) - Follow the install instructions.
- [electron-webrtc](https://npmjs.org/electron-webrtc)

To add WebRTC support in a IPFS node instance, do:

```JavaScript
const wrtc = require('wrtc') // or require('electron-webrtc')()
const WStar = require('libp2p-webrtc-star')
const wstar = new WStar({ wrtc: wrtc })

const node = new IPFS({
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

node.on('ready', () => {
  // your instance with WebRTC is ready
})
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
const node = new IPFS({
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
const node = new IPFS({
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
})

node.on('ready', () => {
  // your instance with websocket-star is ready
})
```

#### I see some slowness when hopping between tabs Chrome with IPFS nodes, is there a reason why?

Yes, unfortunately, due to [Chrome aggressive resource throttling policy](https://github.com/ipfs/js-ipfs/issues/611), it cuts freezes the execution of any background tab, turning an IPFS node that was running on that webpage into a vegetable state.

A way to mitigate this in Chrome, is to run your IPFS node inside a Service Worker, so that the IPFS instance runs in a background process. You can learn how to install an IPFS node as a service worker in here the repo [ipfs-service-worker](https://github.com/ipfs/ipfs-service-worker)

#### Can I use IPFS in my Electron App?

Yes you can and in many ways. Read https://github.com/ipfs/notes/issues/256 for the multiple options.

If your [electron-rebuild step is failing](https://github.com/ipfs/js-ipfs/issues/843), all you need to do is:

```bash
# Electron's version.
export npm_config_target=2.0.0
# The architecture of Electron, can be ia32 or x64.
export npm_config_arch=x64
export npm_config_target_arch=x64
# Download headers for Electron.
export npm_config_disturl=https://atom.io/download/electron
# Tell node-pre-gyp that we are building for Electron.
export npm_config_runtime=electron
# Tell node-pre-gyp to build module from source code.
export npm_config_build_from_source=true
# Install all dependencies, and store cache to ~/.electron-gyp.
HOME=~/.electron-gyp npm install
```

If you find any other issue, please check the [`Electron Support` issue](https://github.com/ipfs/js-ipfs/issues/843).

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

Listing of the main packages used in the IPFS ecosystem. There are also three
specifications worth linking here:

- [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core)
- [`http-api-spec`](https://github.com/ipfs/http-api-spec)
- [`cli spec`](https://github.com/ipfs/specs/tree/master/public-api/cli)

<!---
This table is generated from the script located in `scripts/generate-package-table-for-readme.js`
Please use the same script if you need to update this table.
-->
| Package | Version | Deps | CI | Coverage |
| ---------|---------|---------|---------|--------- |
| **Files** |
| [`ipfs-unixfs-engine`](//github.com/ipfs/js-ipfs-unixfs-engine) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-engine.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs-engine/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-unixfs-engine.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs-engine) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-unixfs-engine/master)](https://ci.ipfs.team/job/ipfs/job/js-ipfs-unixfs-engine/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/js-ipfs-unixfs-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-unixfs-engine) |
| **DAG** |
| [`ipld`](//github.com/ipld/js-ipld) | [![npm](https://img.shields.io/npm/v/ipld.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld/releases) | [![Dep](https://david-dm.org/ipld/js-ipld.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipld/js-ipld/master)](https://ci.ipfs.team/job/ipld/job/js-ipld/job/master/) | [![Coverage Status](https://codecov.io/gh/ipld/js-ipld/branch/master/graph/badge.svg)](https://codecov.io/gh/ipld/js-ipld) |
| [`ipld-dag-pb`](//github.com/ipld/js-ipld-dag-pb) | [![npm](https://img.shields.io/npm/v/ipld-dag-pb.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-pb/releases) | [![Dep](https://david-dm.org/ipld/js-ipld-dag-pb.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-pb) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipld/js-ipld-dag-pb/master)](https://ci.ipfs.team/job/ipld/job/js-ipld-dag-pb/job/master/) | [![Coverage Status](https://codecov.io/gh/ipld/js-ipld-dag-pb/branch/master/graph/badge.svg)](https://codecov.io/gh/ipld/js-ipld-dag-pb) |
| [`ipld-dag-cbor`](//github.com/ipld/js-ipld-dag-cbor) | [![npm](https://img.shields.io/npm/v/ipld-dag-cbor.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-cbor/releases) | [![Dep](https://david-dm.org/ipld/js-ipld-dag-cbor.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-cbor) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipld/js-ipld-dag-cbor/master)](https://ci.ipfs.team/job/ipld/job/js-ipld-dag-cbor/job/master/) | [![Coverage Status](https://codecov.io/gh/ipld/js-ipld-dag-cbor/branch/master/graph/badge.svg)](https://codecov.io/gh/ipld/js-ipld-dag-cbor) |
| **Repo** |
| [`ipfs-repo`](//github.com/ipfs/js-ipfs-repo) | [![npm](https://img.shields.io/npm/v/ipfs-repo.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-repo.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-repo/master)](https://ci.ipfs.team/job/ipfs/job/js-ipfs-repo/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/js-ipfs-repo/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-repo) |
| **Exchange** |
| [`ipfs-block-service`](//github.com/ipfs/js-ipfs-block-service) | [![npm](https://img.shields.io/npm/v/ipfs-block-service.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block-service/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-block-service/master)](https://ci.ipfs.team/job/ipfs/job/js-ipfs-block-service/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/js-ipfs-block-service/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-block-service) |
| [`ipfs-bitswap`](//github.com/ipfs/js-ipfs-bitswap) | [![npm](https://img.shields.io/npm/v/ipfs-bitswap.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-bitswap/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-bitswap.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-bitswap) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-bitswap/master)](https://ci.ipfs.team/job/ipfs/job/js-ipfs-bitswap/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/js-ipfs-bitswap/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-bitswap) |
| **libp2p** |
| [`libp2p`](//github.com/libp2p/js-libp2p) | [![npm](https://img.shields.io/npm/v/libp2p.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p) |
| [`libp2p-circuit`](//github.com/libp2p/js-libp2p-circuit) | [![npm](https://img.shields.io/npm/v/libp2p-circuit.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-circuit/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-circuit.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-circuit) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-circuit/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-circuit/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-circuit/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-circuit) |
| [`libp2p-floodsub`](//github.com/libp2p/js-libp2p-floodsub) | [![npm](https://img.shields.io/npm/v/libp2p-floodsub.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-floodsub/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-floodsub.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-floodsub) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-floodsub/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-floodsub/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-floodsub/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-floodsub) |
| [`libp2p-kad-dht`](//github.com/libp2p/js-libp2p-kad-dht) | [![npm](https://img.shields.io/npm/v/libp2p-kad-dht.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-kad-dht/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-kad-dht.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-kad-dht) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-kad-dht/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-kad-dht/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-kad-dht/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-kad-dht) |
| [`libp2p-mdns`](//github.com/libp2p/js-libp2p-mdns) | [![npm](https://img.shields.io/npm/v/libp2p-mdns.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-mdns/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-mdns.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-mdns) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-mdns/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-mdns/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-mdns/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-mdns) |
| [`libp2p-mplex`](//github.com/libp2p/js-libp2p-mplex) | [![npm](https://img.shields.io/npm/v/libp2p-mplex.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-mplex/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-mplex.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-mplex) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-mplex/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-mplex/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-mplex/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-mplex) |
| [`libp2p-railing`](//github.com/libp2p/js-libp2p-railing) | [![npm](https://img.shields.io/npm/v/libp2p-railing.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-railing/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-railing.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-railing) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-railing/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-railing/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-railing/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-railing) |
| [`libp2p-secio`](//github.com/libp2p/js-libp2p-secio) | [![npm](https://img.shields.io/npm/v/libp2p-secio.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-secio/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-secio.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-secio) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-secio/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-secio/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-secio/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-secio) |
| [`libp2p-tcp`](//github.com/libp2p/js-libp2p-tcp) | [![npm](https://img.shields.io/npm/v/libp2p-tcp.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-tcp/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-tcp.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-tcp) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-tcp/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-tcp/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-tcp/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-tcp) |
| [`libp2p-webrtc-star`](//github.com/libp2p/js-libp2p-webrtc-star) | [![npm](https://img.shields.io/npm/v/libp2p-webrtc-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-webrtc-star/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-webrtc-star/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-webrtc-star/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star) |
| [`libp2p-websocket-star`](//github.com/libp2p/js-libp2p-websocket-star) | [![npm](https://img.shields.io/npm/v/libp2p-websocket-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websocket-star/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-websocket-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websocket-star) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-websocket-star/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-websocket-star/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-websocket-star/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-websocket-star) |
| [`libp2p-websockets`](//github.com/libp2p/js-libp2p-websockets) | [![npm](https://img.shields.io/npm/v/libp2p-websockets.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websockets/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-websockets.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websockets) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-websockets/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-websockets/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-websockets/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-websockets) |
| **Data Types** |
| [`ipfs-block`](//github.com/ipfs/js-ipfs-block) | [![npm](https://img.shields.io/npm/v/ipfs-block.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-block.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-block/master)](https://ci.ipfs.team/job/ipfs/job/js-ipfs-block/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/js-ipfs-block/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-block) |
| [`ipfs-unixfs`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-unixfs/master)](https://ci.ipfs.team/job/ipfs/job/js-ipfs-unixfs/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) |
| [`peer-id`](//github.com/libp2p/js-peer-id) | [![npm](https://img.shields.io/npm/v/peer-id.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-id/releases) | [![Dep](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-peer-id/master)](https://ci.ipfs.team/job/libp2p/job/js-peer-id/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-peer-id/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-peer-id) |
| [`peer-info`](//github.com/libp2p/js-peer-info) | [![npm](https://img.shields.io/npm/v/peer-info.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-info/releases) | [![Dep](https://david-dm.org/libp2p/js-peer-info.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-info) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-peer-info/master)](https://ci.ipfs.team/job/libp2p/job/js-peer-info/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-peer-info/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-peer-info) |
| [`multiaddr`](//github.com/multiformats/js-multiaddr) | [![npm](https://img.shields.io/npm/v/multiaddr.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multiaddr/releases) | [![Dep](https://david-dm.org/multiformats/js-multiaddr.svg?style=flat-square)](https://david-dm.org/multiformats/js-multiaddr) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=multiformats/js-multiaddr/master)](https://ci.ipfs.team/job/multiformats/job/js-multiaddr/job/master/) | [![Coverage Status](https://codecov.io/gh/multiformats/js-multiaddr/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-multiaddr) |
| [`multihashes`](//github.com/multiformats/js-multihash) | [![npm](https://img.shields.io/npm/v/multihashes.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihash/releases) | [![Dep](https://david-dm.org/multiformats/js-multihash.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihash) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=multiformats/js-multihash/master)](https://ci.ipfs.team/job/multiformats/job/js-multihash/job/master/) | [![Coverage Status](https://codecov.io/gh/multiformats/js-multihash/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-multihash) |
| **Crypto** |
| [`libp2p-crypto`](//github.com/libp2p/js-libp2p-crypto) | [![npm](https://img.shields.io/npm/v/libp2p-crypto.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-crypto/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-crypto.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-crypto) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-crypto/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-crypto/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-crypto/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-crypto) |
| [`libp2p-keychain`](//github.com/libp2p/js-libp2p-keychain) | [![npm](https://img.shields.io/npm/v/libp2p-keychain.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-keychain/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-keychain.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-keychain) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=libp2p/js-libp2p-keychain/master)](https://ci.ipfs.team/job/libp2p/job/js-libp2p-keychain/job/master/) | [![Coverage Status](https://codecov.io/gh/libp2p/js-libp2p-keychain/branch/master/graph/badge.svg)](https://codecov.io/gh/libp2p/js-libp2p-keychain) |
| **Generics/Utils** |
| [`ipfs-api`](//github.com/ipfs/js-ipfs-api) | [![npm](https://img.shields.io/npm/v/ipfs-api.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-api/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-api.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-api) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/js-ipfs-api/master)](https://ci.ipfs.team/job/ipfs/job/js-ipfs-api/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/js-ipfs-api/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-ipfs-api) |
| [`ipfs-multipart`](//github.com/ipfs/ipfs-multipart) | [![npm](https://img.shields.io/npm/v/ipfs-multipart.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/ipfs-multipart/releases) | [![Dep](https://david-dm.org/ipfs/ipfs-multipart.svg?style=flat-square)](https://david-dm.org/ipfs/ipfs-multipart) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/ipfs-multipart/master)](https://ci.ipfs.team/job/ipfs/job/ipfs-multipart/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/ipfs-multipart/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/ipfs-multipart) |
| [`is-ipfs`](//github.com/ipfs/is-ipfs) | [![npm](https://img.shields.io/npm/v/is-ipfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/is-ipfs/releases) | [![Dep](https://david-dm.org/ipfs/is-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/is-ipfs) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=ipfs/is-ipfs/master)](https://ci.ipfs.team/job/ipfs/job/is-ipfs/job/master/) | [![Coverage Status](https://codecov.io/gh/ipfs/is-ipfs/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/is-ipfs) |
| [`multihashing`](//github.com/multiformats/js-multihashing) | [![npm](https://img.shields.io/npm/v/multihashing.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihashing/releases) | [![Dep](https://david-dm.org/multiformats/js-multihashing.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihashing) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=multiformats/js-multihashing/master)](https://ci.ipfs.team/job/multiformats/job/js-multihashing/job/master/) | [![Coverage Status](https://codecov.io/gh/multiformats/js-multihashing/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-multihashing) |
| [`mafmt`](//github.com/multiformats/js-mafmt) | [![npm](https://img.shields.io/npm/v/mafmt.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-mafmt/releases) | [![Dep](https://david-dm.org/multiformats/js-mafmt.svg?style=flat-square)](https://david-dm.org/multiformats/js-mafmt) | [![Build Status](https://ci.ipfs.team/buildStatus/icon?job=multiformats/js-mafmt/master)](https://ci.ipfs.team/job/multiformats/job/js-mafmt/job/master/) | [![Coverage Status](https://codecov.io/gh/multiformats/js-mafmt/branch/master/graph/badge.svg)](https://codecov.io/gh/multiformats/js-mafmt) |

## Development

### Clone and install dependencies

```sh
> git clone https://github.com/ipfs/js-ipfs.git
> cd js-ipfs
> npm install
```

### Run unit tests

```sh
# run all the unit tsts
> npm test

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
```

### Run interop tests

Run the interop tests with https://github.com/ipfs/interop

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

```
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
├── http-api        # The HTTP-API implementation of IPFS as defined by http-api-spec
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

### IPFS Core Architecture

![](/img/core.png)

What does this image explain?

- IPFS uses `ipfs-repo` which picks `fs` or `indexeddb` as its storage drivers, depending if it is running in Node.js or in the Browser.
- The exchange protocol, `bitswap`, uses the Block Service which in turn uses the Repo, offering a get and put of blocks to the IPFS implementation.
- The DAG API (previously Object) comes from the IPLD Resolver, it can support several IPLD Formats (i.e: dag-pb, dag-cbor, etc).
- The Files API uses `ipfs-unixfs-engine` to import and export files to and from IPFS.
- Swarm, the component that offers a network API, uses libp2p to dial and listen for connections, to use the DHT, for discovery mechanisms, and more. libp2p-ipfs-nodejs is used when running in Node.js and libp2p-ipfs-browser is used when running in the browser.

## Contribute

IPFS implementation in JavaScript is a work in progress. As such, there's a few things you can do right now to help out:

  * Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrastructure behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
  * **Perform code reviews**. More eyes will help (a) speed the project along, (b) ensure quality, and (c) reduce possible future bugs.
  * Take a look at go-ipfs and some of the planning repositories or issues: for instance, the [libp2p spec](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
  * **Add tests**. There can never be enough tests.

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)

<h1 align="center">
  <a href="ipfs.io">
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
  <a href="https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_small" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs.svg?type=small"/></a>
  <a href="https://travis-ci.org/ipfs/js-ipfs"><img src="https://travis-ci.org/ipfs/js-ipfs.svg?branch=master" /></a>
  <a href="https://circleci.com/gh/ipfs/js-ipfs"><img src="https://circleci.com/gh/ipfs/js-ipfs.svg?style=svg" /></a>
  <a href="https://ci.appveyor.com/project/wubalubadubdub/js-ipfs"><img src="https://ci.appveyor.com/api/projects/status/txn75y7843r2ff0p?svg=true" /></a>
  <a href="https://coveralls.io/github/ipfs/js-ipfs?branch=master"><img src="https://coveralls.io/repos/github/ipfs/js-ipfs/badge.svg?branch=master"></a>
  <br>
  <a href="https://david-dm.org/ipfs/js-ipfs"><img src="https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D6.0.0-orange.svg?style=flat-square" /></a>
  <br>
</p>

### Project status

We've come a long way, but this project is still in Alpha, lots of development is happening, API might change, beware of the Dragons 🐉..

**Want to get started?** Check our [examples folder](/examples) to learn how to spawn an IPFS node in Node.js and in the Browser.

You can check the development status at the [Waffle Board](https://waffle.io/ipfs/js-ipfs).

[![Throughput Graph](https://graphs.waffle.io/ipfs/js-ipfs/throughput.svg)](https://waffle.io/ipfs/js-ipfs/metrics/throughput)

**Please read this:** DHT (automatic content discovery) and Circuit Relay (pierce through NATs and dial between any node in the network) are two fundamental pieces that are not finalized yet. There are multiple applications that can be built without these two services but nevertheless they are fundamental to get that magic IPFS experience. If you want to track progress or contribute, please follow:

- DHT: https://github.com/ipfs/js-ipfs/pull/856
- Relay: https://github.com/ipfs/js-ipfs/pull/1063

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
    - [How to create a IPFS node instance](#create-a-ipfs-node-instance)
  - [Tutorials and Examples](#tutorials-and-examples)
  - [API Docs](#api)
    - [Files](#files)
    - [Graph](#graph)
    - [Network](#network)
    - [Node Management](#node-management)
    - [Domain data types](#domain-data-types)
- [FAQ](#faq)
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

### IPFS Module

Use the IPFS Module as a dependency of a project to spawn in process instances of IPFS.

#### Create a IPFS node instance

Creating an IPFS instance couldn't be easier, all you have to do is:

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

#### Advanced options when creating an IPFS node.

When starting a node, you can:

```JavaScript
// IPFS will need a repo, it can create one for you or you can pass
// it a repo instance of the type IPFS Repo
// https://github.com/ipfs/js-ipfs-repo
const repo = <IPFS Repo instance or repo path>

const node = new IPFS({
  repo: repo,
  init: true, // default
  // init: false,
  // init: {
  //   bits: 1024 // size of the RSA key generated
  // },
  start: true, // default
  // start: false,
  EXPERIMENTAL: { // enable experimental features
    pubsub: true,
    sharding: true, // enable dir sharding
    dht: true // enable KadDHT, currently not interopable with go-ipfs
  },
  config: { // overload the default IPFS node config, find defaults at https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime
    Addresses: {
      Swarm: [
        '/ip4/127.0.0.1/tcp/1337'
      ]
    }
  },
  libp2p: { // add custom modules to the libp2p stack of your node
    modules: {}
  }
})

// Events

node.on('ready', () => {})    // Node is ready to use when you first create it
node.on('error', (err) => {}) // Node has hit some error while initing/starting

node.on('init', () => {})     // Node has successfully finished initing the repo
node.on('start', () => {})    // Node has started
node.on('stop', () => {})     // Node has stopped
```

### [Tutorials and Examples](/examples)

You can find some examples and tutorials in the [examples](/examples) folder, these exist to help you get started using `js-ipfs`.

### API

[![](https://github.com/ipfs/interface-ipfs-core/raw/master/img/badge.png)](https://github.com/ipfs/interface-ipfs-core)

A complete API definition is in the works. Meanwhile, you can learn how to you use js-ipfs through the standard interface at [![](https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg)](https://github.com/ipfs/interface-ipfs-core).

#### `Files`

- [files](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md)
  - [`ipfs.files.add(data, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#add)
  - [`ipfs.files.addReadableStream([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#addreadablestream)
  - [`ipfs.files.addPullStream([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#addpullstream)
  - [`ipfs.files.cat(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#cat)
  - [`ipfs.files.catReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#catreadablestream)
  - [`ipfs.files.catPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#catpullstream)
  - [`ipfs.files.get(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#get)
  - [`ipfs.files.getReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#getreadablestream)
  - [`ipfs.files.getPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#getpullstream)  

- [block](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md)
  - [`ipfs.block.get(cid, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#get)
  - [`ipfs.block.put(block, cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#put)
  - [`ipfs.block.stat(cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#stat)

- [repo](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)
  - `ipfs.repo.init`
  - `ipfs.repo.version`
  - `ipfs.repo.gc` (not implemented, yet!)

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
  - [`ipfs.pubsub.subscribe(topic, options, handler, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubsubscribe)
  - [`ipfs.pubsub.unsubscribe(topic, handler)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubunsubscribe)
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
  - `ipfs.stop([callback])`
  - `ipfs.isOnline()`
  
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
- [`ipfs.types.multihash`](https://github.com/multiformats/js-multihash)
- [`ipfs.types.CID`](https://github.com/ipld/js-cid)

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
        "/dns4/wrtc-star.discovery.libp2p.io/tcp/433/wss/p2p-webrtc-star"
      ]
    }
  },
  libp2p: {
    modules: {
      transport: [wstar],
      discovery: [wstar.discovery]
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
export npm_config_target=1.7.6
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

## Packages

| Package | Version | Deps | DevDeps | Travis | Circle | AppVeyor | Coverage |
|---------|---------|------|---------|--------|--------|----------|----------|
| **API Specs**                                                              |
| [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core) | [![npm](https://img.shields.io/npm/v/interface-ipfs-core.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/interface-ipfs-core/releases) | [![Dep](https://david-dm.org/ipfs/interface-ipfs-core.svg?style=flat-square)](https://david-dm.org/ipfs/interface-ipfs-core) | [![devDep](https://david-dm.org/ipfs/interface-ipfs-core/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/interface-ipfs-core?type=dev) | [![Travis](https://travis-ci.org/ipfs/interface-ipfs-core.svg?branch=master)](https://travis-ci.org/ipfs/interface-ipfs-core) | | | |
| [`http-api-spec`](https://github.com/ipfs/http-api-spec) | | |
| [`cli spec`](https://github.com/ipfs/specs/tree/master/public-api/cli) | | | |
| **Repo**                                                                   |
| [`ipfs-repo`](//github.com/ipfs/js-ipfs-repo) | [![npm](https://img.shields.io/npm/v/ipfs-repo.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-repo.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo) | [![devDep](https://david-dm.org/ipfs/js-ipfs-repo/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo?type=dev) | [![Travis](https://travis-ci.org/ipfs/js-ipfs-repo.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-repo) | [![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-repo.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-repo) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/js-ipfs-repo?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-repo/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-repo?branch=master) |
| **DAG**                                                                    |
| [`ipld-resolver`](https://github.com/ipld/js-ipld-resolver) | [![npm](https://img.shields.io/npm/v/ipld-resolver.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipfs-repo/releases) | [![Dep](https://david-dm.org/ipld/js-ipld-resolver.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-resolver) | [![devDep](https://david-dm.org/ipld/js-ipld-resolver/dev-status.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-resolver?type=dev) | [![Travis](https://travis-ci.org/ipld/js-ipld-resolver.svg?branch=master)](https://travis-ci.org/ipld/js-ipld-resolver) | [![Circle CI](https://circleci.com/gh/ipld/js-ipld-resolver.svg?style=svg)](https://circleci.com/gh/ipld/js-ipld-resolver) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipld/js-ipld-resolver?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipld/js-ipld-resolver/badge.svg?branch=master)](https://coveralls.io/github/ipld/js-ipld-resolver?branch=master) |
| [`ipld-dag-pb`](https://github.com/ipld/js-ipld-dag-pb) | [![npm](https://img.shields.io/npm/v/ipld-dag-pb.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-pb/releases) | [![Dep](https://david-dm.org/ipld/js-ipld-dag-pb.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-pb) | [![devDep](https://david-dm.org/ipld/js-ipld-dag-pb/dev-status.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-pb?type=dev) | [![Travis](https://travis-ci.org/ipld/js-ipld-dag-pb.svg?branch=master)](https://travis-ci.org/ipld/js-ipld-dag-pb) | [![Circle CI](https://circleci.com/gh/ipld/js-ipld-dag-pb.svg?style=svg)](https://circleci.com/gh/ipld/js-ipld-dag-pb) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipld/js-ipld-dag-pb?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipld/js-ipld-dag-pb/badge.svg?branch=master)](https://coveralls.io/github/ipld/js-ipld-dag-pb?branch=master) |
| [`ipld-dag-cbor`](https://github.com/ipld/js-ipld-dag-cbor) | [![npm](https://img.shields.io/npm/v/ipld-dag-cbor.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-cbor/releases) | [![Dep](https://david-dm.org/ipld/js-ipld-dag-cbor.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-cbor) | [![devDep](https://david-dm.org/ipld/js-ipld-dag-cbor/dev-status.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-cbor?type=dev) | [![Travis](https://travis-ci.org/ipld/js-ipld-dag-cbor.svg?branch=master)](https://travis-ci.org/ipld/js-ipld-dag-cbor) | [![Circle](https://circleci.com/gh/ipld/js-ipld-dag-cbor.svg?style=svg)](https://circleci.com/gh/ipld/js-ipld-dag-cbor) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipld/js-ipld-dag-cbor?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipld/js-ipld-dag-pb/badge.svg?branch=master)](https://coveralls.io/github/ipld/js-ipld-dag-pb?branch=master) |
| **Files**                                                                  |
| [`ipfs-unixfs-engine`](//github.com/ipfs/js-ipfs-unixfs-engine) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-engine.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs-engine/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-unixfs-engine.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs-engine) | [![devDep](https://david-dm.org/ipfs/js-ipfs-unixfs-engine/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs-engine?type=dev) | [![Travis](https://travis-ci.org/ipfs/js-ipfs-unixfs-engine.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-unixfs-engine) | [![Circle](https://circleci.com/gh/ipfs/js-ipfs-unixfs-engine.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-unixfs-engine) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/js-ipfs-unixfs-engine?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-unixfs-engine/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-unixfs-engine?branch=master) |
| **Exchange**                                                               |
| [`ipfs-block-service`](//github.com/ipfs/js-ipfs-block-service) | [![npm](https://img.shields.io/npm/v/ipfs-block-service.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block-service/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service) | [![devDep](https://david-dm.org/ipfs/js-ipfs-block-service/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service?type=dev) | [![Travis](https://travis-ci.org/ipfs/js-ipfs-block-service.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-block-service) | [![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-block-service.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-block-service) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/js-ipfs-block-service?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-block-service/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-block-service?branch=master) |
| [`ipfs-bitswap`](//github.com/ipfs/js-ipfs-bitswap) | [![npm](https://img.shields.io/npm/v/ipfs-bitswap.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-bitswap/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-bitswap.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-bitswap) | [![devDep](https://david-dm.org/ipfs/js-ipfs-bitswap/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-bitswap?type=dev) | [![Travis](https://travis-ci.org/ipfs/js-ipfs-bitswap.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-bitswap) | [![Circle](https://circleci.com/gh/ipfs/js-ipfs-bitswap.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-bitswap) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/js-ipfs-bitswap?svg=true) | [![Coverage](https://coveralls.io/repos/github/ipfs/js-ipfs-bitswap/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-bitswap?branch=master) |
| **Swarm/libp2p**                                                           |
| [`js-libp2p`](https://github.com/libp2p/js-libp2p) | [![npm](https://img.shields.io/npm/v/libp2p.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p) | [![devDep](https://david-dm.org/libp2p/js-libp2p/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p) | [![Circle](https://circleci.com/gh/libp2p/js-libp2p.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p?svg=true) | [![Coverage](https://coveralls.io/repos/github/libp2p/js-libp2p/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p?branch=master) |
| [`js-libp2p-circuit`](https://github.com/libp2p/js-libp2p-circuit) | [![npm](https://img.shields.io/npm/v/libp2p-circuit.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-circuit/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-circuit.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-circuit) | [![devDep](https://david-dm.org/libp2p/js-libp2p-circuit/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-circuit?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-circuit.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-circuit) | [![Circle](https://circleci.com/gh/libp2p/js-libp2p-circuit.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-circuit) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-circuit?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-circuit/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-circuit?branch=master) |
| [`js-libp2p-floodsub`](https://github.com/libp2p/js-libp2p-floodsub) | [![npm](https://img.shields.io/npm/v/libp2p-floodsub.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-floodsub/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-floodsub.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-floodsub) | [![devDep](https://david-dm.org/libp2p/js-libp2p-floodsub/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-floodsub?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-floodsub.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-floodsub) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-floodsub.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-floodsub) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-floodsub?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-floodsub/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-floodsub?branch=master) |
| [`js-libp2p-kad-dht`](https://github.com/libp2p/js-libp2p-kad-dht) | [![npm](https://img.shields.io/npm/v/libp2p-kad-dht.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-kad-dht/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-kad-dht.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-kad-dht) | [![devDep](https://david-dm.org/libp2p/js-libp2p-kad-dht/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-kad-dht?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-kad-dht.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-kad-dht) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-kad-dht.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-kad-dht) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-kad-dht?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-kad-dht/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-kad-dht?branch=master) |
| [`js-libp2p-mdns`](https://github.com/libp2p/js-libp2p-mdns) | [![npm](https://img.shields.io/npm/v/libp2p-mdns.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-mdns/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-mdns.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-mdns) | [![devDep](https://david-dm.org/libp2p/js-libp2p-mdns/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-mdns?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-mdns.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-mdns) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-mdns.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-mdns) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-mdns?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-mdns/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-mdns?branch=master) |
| [`js-libp2p-multiplex`](https://github.com/libp2p/js-libp2p-multiplex) | [![npm](https://img.shields.io/npm/v/libp2p-multiplex.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-multiplex/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-multiplex.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-multiplex) | [![devDep](https://david-dm.org/libp2p/js-libp2p-multiplex/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-multiplex?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-multiplex.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-multiplex) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-multiplex.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-multiplex) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-multiplex?svg=true) | ![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square) |
| [`js-libp2p-railing`](https://github.com/libp2p/js-libp2p-railing) | [![npm](https://img.shields.io/npm/v/libp2p-railing.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-railing/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-railing.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-railing) | [![devDep](https://david-dm.org/libp2p/js-libp2p-railing/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-railing?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-railing.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-railing) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-railing.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-railing) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-railing?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-railing/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-railing?branch=master) |
| [`js-libp2p-secio`](https://github.com/libp2p/js-libp2p-secio) | [![npm](https://img.shields.io/npm/v/libp2p-secio.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-secio/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-secio.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-secio) | [![devDep](https://david-dm.org/libp2p/js-libp2p-secio/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-secio?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-secio.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-secio) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-secio.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-secio) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-secio?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-secio/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-secio?branch=master) |
| [`js-libp2p-tcp`](https://github.com/libp2p/js-libp2p-tcp) | [![npm](https://img.shields.io/npm/v/libp2p-tcp.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-tcp/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-tcp.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-tcp) | [![devDep](https://david-dm.org/libp2p/js-libp2p-tcp/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-tcp?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-tcp.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-tcp) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-tcp.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-tcp) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-tcp?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-tcp/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-tcp?branch=master) |
| [`js-libp2p-webrtc-star`](https://github.com/libp2p/js-libp2p-webrtc-star) | [![npm](https://img.shields.io/npm/v/libp2p-webrtc-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-webrtc-star/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star) | [![devDep](https://david-dm.org/libp2p/js-libp2p-webrtc-star/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-webrtc-star.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-webrtc-star) | [![Circle](https://circleci.com/gh/libp2p/js-libp2p-webrtc-star.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-webrtc-star) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-webrtc-star?svg=true) | [![Coverage](https://coveralls.io/repos/github/libp2p/js-libp2p-webrtc-star/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-webrtc-star?branch=master) |
| [`js-libp2p-websocket-star`](https://github.com/libp2p/js-libp2p-websocket-star) | [![npm](https://img.shields.io/npm/v/libp2p-websocket-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websocket-star/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-websocket-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websocket-star) | [![devDep](https://david-dm.org/libp2p/js-libp2p-websocket-star/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websocket-star?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-websocket-star.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-websocket-star) | [![Circle](https://circleci.com/gh/libp2p/js-libp2p-websocket-star.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-websocket-star) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-websocket-star?svg=true) | [![Coverage](https://coveralls.io/repos/github/libp2p/js-libp2p-websocket-star/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-websocket-star?branch=master) |
| [`js-libp2p-websockets`](https://github.com/libp2p/js-libp2p-websockets) | [![npm](https://img.shields.io/npm/v/libp2p-websockets.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websockets/releases) | [![Dep](https://david-dm.org/libp2p/js-libp2p-websockets.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websockets) | [![devDep](https://david-dm.org/libp2p/js-libp2p-websockets/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websockets?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-libp2p-websockets.svg?branch=master)](https://travis-ci.org/libp2p/js-libp2p-websockets) | [![Circle CI](https://circleci.com/gh/libp2p/js-libp2p-websockets.svg?style=svg)](https://circleci.com/gh/libp2p/js-libp2p-websockets) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-libp2p-websockets?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-libp2p-websockets/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-libp2p-websockets?branch=master) |
| **Data Types**                                                             |
| [`ipfs-block`](//github.com/ipfs/js-ipfs-block) | [![npm](https://img.shields.io/npm/v/ipfs-block.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-block.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block) | [![devDep](https://david-dm.org/ipfs/js-ipfs-block/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block?type=dev) | [![Travis](https://travis-ci.org/ipfs/js-ipfs-block.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-block) | [![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-block.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-block) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/js-ipfs-block?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-block/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-block?branch=master) |
| [`ipfs-unixfs`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![devDep](https://david-dm.org/ipfs/js-ipfs-unixfs/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs?type=dev) | [![Travis](https://travis-ci.org/ipfs/js-ipfs-unixfs.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-unixfs) | [![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-unixfs.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-unixfs) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/js-ipfs-unixfs?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-unixfs/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-unixfs?branch=master) |
| [`peer-id`](//github.com/libp2p/js-peer-id) | [![npm](https://img.shields.io/npm/v/peer-id.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-id/releases) | [![Dep](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id) | [![devDep](https://david-dm.org/libp2p/js-peer-id/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-peer-id.svg?branch=master)](https://travis-ci.org/libp2p/js-peer-id) | [![Circle CI](https://circleci.com/gh/libp2p/js-peer-id.svg?style=svg)](https://circleci.com/gh/libp2p/js-peer-id) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-peer-id?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-peer-id/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-peer-id?branch=master) |
| [`peer-info`](//github.com/libp2p/js-peer-info) | [![npm](https://img.shields.io/npm/v/peer-info.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-info/releases) | [![Dep](https://david-dm.org/libp2p/js-peer-info.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-info) | [![devDep](https://david-dm.org/libp2p/js-peer-info/dev-status.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-info?type=dev) | [![Travis](https://travis-ci.org/libp2p/js-peer-info.svg?branch=master)](https://travis-ci.org/libp2p/js-peer-info) | [![Circle CI](https://circleci.com/gh/libp2p/js-peer-info.svg?style=svg)](https://circleci.com/gh/libp2p/js-peer-info) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/libp2p/js-peer-info?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/libp2p/js-peer-info/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-peer-info?branch=master) |
| [`multiaddr`](//github.com/multiformats/js-multiaddr) | [![npm](https://img.shields.io/npm/v/multiaddr.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multiaddr/releases) | [![Dep](https://david-dm.org/multiformats/js-multiaddr.svg?style=flat-square)](https://david-dm.org/multiformats/js-multiaddr) | [![devDep](https://david-dm.org/multiformats/js-multiaddr/dev-status.svg?style=flat-square)](https://david-dm.org/multiformats/js-multiaddr?type=dev) | [![Travis](https://travis-ci.org/multiformats/js-multiaddr.svg?branch=master)](https://travis-ci.org/multiformats/js-multiaddr) | [![Circle CI](https://circleci.com/gh/multiformats/js-multiaddr.svg?style=svg)](https://circleci.com/gh/multiformats/js-multiaddr) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/multiformats/js-multiaddr?svg=true) | [![Coverage Status](https://img.shields.io/coveralls/multiformats/js-multiaddr/master.svg?style=flat-square)](https://coveralls.io/github/multiformats/js-multiaddr?branch=master) |
| [`multihashes`](//github.com/multiformats/js-multihash) | [![npm](https://img.shields.io/npm/v/multihashes.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihash/releases) | [![Dep](https://david-dm.org/multiformats/js-multihash.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihash) | [![devDep](https://david-dm.org/multiformats/js-multihash/dev-status.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihash?type=dev) | [![Travis](https://travis-ci.org/multiformats/js-multihash.svg?branch=master)](https://travis-ci.org/multiformats/js-multihash) | [![Circle CI](https://circleci.com/gh/multiformats/js-multihash.svg?style=svg)](https://circleci.com/gh/multiformats/js-multihash) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/multiformats/js-multihash?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/multiformats/js-multihash/badge.svg?branch=master)](https://coveralls.io/github/multiformats/js-multihash?branch=master) |
| **Generics/Utils**                                                         |
| [`ipfs-api`](//github.com/ipfs/js-ipfs-api) | [![npm](https://img.shields.io/npm/v/ipfs-api.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-api/releases) | [![Dep](https://david-dm.org/ipfs/js-ipfs-api.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-api) | [![devDep](https://david-dm.org/ipfs/js-ipfs-api/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-api?type=dev) | [![Travis](https://travis-ci.org/ipfs/js-ipfs-api.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-api) | [![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-api.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-api) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/js-ipfs-api?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-api/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-api?branch=master) |
| [`ipfs-multipart`](//github.com/xicombd/ipfs-multipart) | [![npm](https://img.shields.io/npm/v/ipfs-multipart.svg?maxAge=86400&style=flat-square)](//github.com/xicombd/ipfs-multipart/releases) | [![Dep](https://david-dm.org/xicombd/ipfs-multipart.svg?style=flat-square)](https://david-dm.org/xicombd/ipfs-multipart) | [![devDep](https://david-dm.org/xicombd/ipfs-multipart/dev-status.svg?style=flat-square)](https://david-dm.org/xicombd/ipfs-multipart?type=dev) | [![Travis](https://travis-ci.org/xicombd/ipfs-multipart.svg?branch=master)](https://travis-ci.org/xicombd/ipfs-multipart) | | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/xicombd/ipfs-multipart?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/xicombd/ipfs-multipart/badge.svg?branch=master)](https://coveralls.io/github/xicombd/ipfs-multipart?branch=master) |
| [`is-ipfs`](https://github.com/ipfs/is-ipfs) | [![npm](https://img.shields.io/npm/v/is-ipfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/is-ipfs/releases) | [![Dep](https://david-dm.org/ipfs/is-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/is-ipfs) | [![devDep](https://david-dm.org/ipfs/is-ipfs/dev-status.svg?style=flat-square)](https://david-dm.org/ipfs/is-ipfs?type=dev) | [![Travis](https://travis-ci.org/ipfs/is-ipfs.svg?branch=master)](https://travis-ci.org/ipfs/is-ipfs) | | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/ipfs/is-ipfs?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/ipfs/is-ipfs/badge.svg?branch=master)](https://coveralls.io/github/ipfs/is-ipfs?branch=master) |
| [`multihashing`](//github.com/multiformats/js-multihashing) | [![npm](https://img.shields.io/npm/v/multihashing.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihashing/releases) | [![Dep](https://david-dm.org/multiformats/js-multihashing.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihashing) | [![devDep](https://david-dm.org/multiformats/js-multihashing/dev-status.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihashing?type=dev) | [![Travis](https://travis-ci.org/multiformats/js-multihashing.svg?branch=master)](https://travis-ci.org/multiformats/js-multihashing) | [![Circle CI](https://circleci.com/gh/multiformats/js-multihashing.svg?style=svg)](https://circleci.com/gh/jbenet/js-multihashing) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/multiformats/js-multihashing?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/jbenet/js-multihashing/badge.svg?branch=master)](https://coveralls.io/github/jbenet/js-multihashing?branch=master) |
| [`mafmt`](//github.com/whyrusleeping/js-mafmt) | [![npm](https://img.shields.io/npm/v/mafmt.svg?maxAge=86400&style=flat-square)](//github.com/whyrusleeping/js-mafmt/releases) | [![Dep](https://david-dm.org/whyrusleeping/js-mafmt.svg?style=flat-square)](https://david-dm.org/whyrusleeping/js-mafmt) | [![devDep](https://david-dm.org/whyrusleeping/js-mafmt/dev-status.svg?style=flat-square)](https://david-dm.org/whyrusleeping/js-mafmt?type=dev) | [![Travis](https://travis-ci.org/whyrusleeping/js-mafmt.svg?branch=master)](https://travis-ci.org/whyrusleeping/js-mafmt) | [![Circle CI](https://circleci.com/gh/whyrusleeping/js-mafmt.svg?style=svg)](https://circleci.com/gh/whyrusleeping/js-mafmt) | ![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/whyrusleeping/js-mafmt?svg=true) | [![Coverage Status](https://coveralls.io/repos/github/whyrusleeping/js-mafmt/badge.svg?branch=master)](https://coveralls.io/github/whyrusleeping/js-mafmt?branch=master) |

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
> npm run test:node:core

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
  * **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)

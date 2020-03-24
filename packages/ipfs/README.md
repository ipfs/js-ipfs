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
  <a href="https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg"></a>
  <a href="https://travis-ci.com/ipfs/js-ipfs?branch=master"><img src="https://badgen.net/travis/ipfs/js-ipfs?branch=master" /></a>
  <a href="https://codecov.io/gh/ipfs/js-ipfs"><img src="https://badgen.net/codecov/c/github/ipfs/js-ipfs" /></a>
  <a href="https://bundlephobia.com/result?p=ipfs"><img src="https://badgen.net/bundlephobia/minzip/ipfs"></a>
  <a href="https://david-dm.org/ipfs/js-ipfs?path=packages/ipfs"><img src="https://david-dm.org/ipfs/js-ipfs.svg?style=flat&path=packages/ipfs" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat"></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat" /></a>
  <a href="https://www.npmjs.com/package/ipfs"><img src="https://img.shields.io/npm/dm/ipfs.svg" /></a>
  <a href="https://www.jsdelivr.com/package/npm/ipfs"><img src="https://data.jsdelivr.com/v1/package/npm/ipfs/badge"/></a>
  <br>
</p>

> **Upgrading from <=0.40 to 0.41?** See the [release notes](https://github.com/ipfs/js-ipfs/issues/2656) for the list of API changes and the [migration guide](https://gist.github.com/alanshaw/04b2ddc35a6fff25c040c011ac6acf26).

### Project status - `Alpha` <!-- omit in toc -->

We've come a long way, but this project is still in Alpha, lots of development is happening, API might change, beware of the Dragons 🐉.

**Want to get started?** Check our [examples folder](/examples) to learn how to spawn an IPFS node in Node.js and in the Browser.

**Please read this:** The [DHT](https://en.wikipedia.org/wiki/Distributed_hash_table), a fundamental piece for automatic content and peer discovery is not yet complete. There are multiple applications that can be built without this service but nevertheless it is fundamental to getting that magic IPFS experience. The current status is that implementation is done and merged and we're working on performance issues. Expect the DHT to be available in a release very soon.

[**`Weekly Core Implementations Call`**](https://github.com/ipfs/team-mgmt/issues/992)

## Tech Lead <!-- omit in toc -->

[David Dias](https://github.com/daviddias)

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](http://github.com/achingbrain)

## Table of Contents <!-- omit in toc -->

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
        - [Configuring Delegate Routers](#configuring-delegate-routers)
    - [Core API](#core-api)
    - [Static types and utils](#static-types-and-utils)
      - [Glob source](#glob-source)
        - [`globSource(path, [options])`](#globsourcepath-options)
        - [Example](#example)
      - [URL source](#url-source)
        - [`urlSource(url)`](#urlsourceurl)
        - [Example](#example-1)
- [FAQ](#faq)
    - [How to enable WebRTC support for js-ipfs in the Browser](#how-to-enable-webrtc-support-for-js-ipfs-in-the-browser)
    - [Is there WebRTC support for js-ipfs with Node.js?](#is-there-webrtc-support-for-js-ipfs-with-nodejs)
    - [How can I configure an IPFS node to use a custom `signaling endpoint` for my WebRTC transport?](#how-can-i-configure-an-ipfs-node-to-use-a-custom-signaling-endpoint-for-my-webrtc-transport)
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

Once installed, please follow the [Getting Started Guide](https://docs.ipfs.io/introduction/usage/) to learn how to initialize your node and run the daemon.

### Use in the browser

Learn how to bundle with browserify and webpack in the [`examples`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/examples) folder.

You can also load it using a `<script>` using the [jsDelivr](https://www.jsdelivr.com/package/npm/ipfs) CDN. Inserting one of the following lines will make an `Ipfs` object available in the global namespace.


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

The IPFS Daemon exposes the API defined in the [HTTP API spec](https://docs.ipfs.io/reference/api/http/). You can use any of the IPFS HTTP-API client libraries with it, such as: [js-ipfs-http-client](https://github.com/ipfs/js-ipfs-http-client).

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

###### Configuring Delegate Routers

If you need to support Delegated Content and/or Peer Routing, you can enable it by specifying the multiaddrs of your delegate nodes in the config via `options.config.Addresses.Delegates`. If you need to run a delegate router we encourage you to run your own, with go-ipfs. You can see instructions for doing so in the [delegated routing example](https://github.com/libp2p/js-libp2p/tree/master/examples/delegated-routing).

If you are not able to run your own delegate router nodes, we currently have two nodes that support delegated routing. **Important**: As many people may be leveraging these nodes, performance may be affected, which is why we recommend running your own nodes in production.

Available delegate multiaddrs are:
- `/dns4/node0.delegate.ipfs.io/tcp/443/https`
- `/dns4/node1.delegate.ipfs.io/tcp/443/https`

**Note**: If more than 1 delegate multiaddr is specified, the actual delegate will be randomly selected on startup.

**Note**: If you wish to use delegated routing and are creating your node _programmatically_ in Node.js or the browser you must `npm install libp2p-delegated-content-routing` and/or `npm install libp2p-delegated-peer-routing` and provide configured instances of them in [`options.libp2p`](#optionslibp2p). See the module repos for further instructions:

- https://github.com/libp2p/js-libp2p-delegated-content-routing
- https://github.com/libp2p/js-libp2p-delegated-peer-routing

#### Core API

[![](https://github.com/ipfs/js-ipfs/raw/master/packages/interface-ipfs-core/img/badge.png)](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core)

The IPFS core API provides all functionality that is not specific to setting up and starting or stopping a node. This API is available directly on an IPFS instance, on the command line (when using the CLI interface), and as an HTTP REST API. For a complete reference, see [![](https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg)](https://github.com/ipfs/js-ipfs/tree/master/docs/api/README.md).

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

##### Glob source

A utility to allow files on the file system to be easily added to IPFS.

###### `globSource(path, [options])`

- `path`: A path to a single file or directory to glob from
- `options`: Optional options
- `options.recursive`: If `path` is a directory, use option `{ recursive: true }` to add the directory and all its sub-directories.
- `options.ignore`: To exclude file globs from the directory, use option `{ ignore: ['ignore/this/folder/**', 'and/this/file'] }`.
- `options.hidden`: Hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`.

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

###### Example

```js
const IPFS = require('ipfs')
const { globSource } = IPFS
const ipfs = await IPFS.create()
for await (const file of ipfs.add(globSource('./docs', { recursive: true }))) {
  console.log(file)
}
/*
{
  path: 'docs/assets/anchor.js',
  cid: CID('QmVHxRocoWgUChLEvfEyDuuD6qJ4PhdDL2dTLcpUy3dSC2'),
  size: 15347
}
{
  path: 'docs/assets/bass-addons.css',
  cid: CID('QmPiLWKd6yseMWDTgHegb8T7wVS7zWGYgyvfj7dGNt2viQ'),
  size: 232
}
...
*/
```

##### URL source

A utility to allow content from the internet to be easily added to IPFS.

###### `urlSource(url)`

- `url`: A string URL or [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance to send HTTP GET request to

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

###### Example

```js
const IPFS = require('ipfs')
const { urlSource } = IPFS
const ipfs = await IPFS.create()
for await (const file of ipfs.add(urlSource('https://ipfs.io/images/ipfs-logo.svg'))) {
  console.log(file)
}
/*
{
  path: 'ipfs-logo.svg',
  cid: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
}
*/
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

- [`interface-ipfs-core`](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core)
- [`HTTP API spec`](https://docs.ipfs.io/reference/api/http)
- [`cli spec`](https://github.com/ipfs/specs/tree/master/public-api/cli)

> This table is generated using the module [`package-table`](https://www.npmjs.com/package/package-table) with `package-table --data=package-list.json`.

| Package | Version | Deps | CI/Travis | Coverage | Lead Maintainer |
| ---------|---------|---------|---------|---------|--------- |
| **Files** |
| [`ipfs-unixfs-exporter`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-exporter.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-unixfs/master)](https://travis-ci.com/ipfs/js-ipfs-unixfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-unixfs-importer`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-importer.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-unixfs/master)](https://travis-ci.com/ipfs/js-ipfs-unixfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-mfs`](//github.com/ipfs/js-ipfs-mfs) | [![npm](https://img.shields.io/npm/v/ipfs-mfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-mfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-mfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-mfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-mfs/master)](https://travis-ci.com/ipfs/js-ipfs-mfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-mfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-mfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-unixfs`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-unixfs/master)](https://travis-ci.com/ipfs/js-ipfs-unixfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| **Repo** |
| [`ipfs-repo`](//github.com/ipfs/js-ipfs-repo) | [![npm](https://img.shields.io/npm/v/ipfs-repo.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-repo.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-repo/master)](https://travis-ci.com/ipfs/js-ipfs-repo) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-repo/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-repo) | [Alex Potsides](mailto:alex@achingbrain.net) |
| **Exchange** |
| [`ipfs-block-service`](//github.com/ipfs/js-ipfs-block-service) | [![npm](https://img.shields.io/npm/v/ipfs-block-service.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block-service/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-block-service/master)](https://travis-ci.com/ipfs/js-ipfs-block-service) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-block-service/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-block-service) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipfs-block`](//github.com/ipfs/js-ipfs-block) | [![npm](https://img.shields.io/npm/v/ipfs-block.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-block.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-block/master)](https://travis-ci.com/ipfs/js-ipfs-block) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-block/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-block) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipfs-bitswap`](//github.com/ipfs/js-ipfs-bitswap) | [![npm](https://img.shields.io/npm/v/ipfs-bitswap.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-bitswap/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-bitswap.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-bitswap) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-bitswap/master)](https://travis-ci.com/ipfs/js-ipfs-bitswap) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-bitswap/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-bitswap) | [Dirk McCormick](mailto:dirk@protocol.ai) |
| **IPNS** |
| [`ipfs-name`](//github.com/ipfs/js-ipfs-name) | [![npm](https://img.shields.io/npm/v/ipfs-name.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-name/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-name.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-name) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-name/master)](https://travis-ci.com/ipfs/js-ipfs-name) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-name/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-name) | N/A |
| **Generics/Utils** |
| [`ipfs-utils`](//github.com/ipfs/js-ipfs) | [![npm](https://img.shields.io/npm/v/ipfs-utils.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs/master)](https://travis-ci.com/ipfs/js-ipfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs) | [Hugo Dias](mailto:hugomrdias@gmail.com) |
| [`ipfs-http-client`](//github.com/ipfs/js-ipfs) | [![npm](https://img.shields.io/npm/v/ipfs-http-client.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs/master)](https://travis-ci.com/ipfs/js-ipfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs) | [Alan Shaw](mailto:alan@tableflip.io) |
| [`ipfs-http-response`](//github.com/ipfs/js-ipfs-http-response) | [![npm](https://img.shields.io/npm/v/ipfs-http-response.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-http-response/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-http-response.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-http-response) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-http-response/master)](https://travis-ci.com/ipfs/js-ipfs-http-response) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-http-response/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-http-response) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`ipfsd-ctl`](//github.com/ipfs/js-ipfsd-ctl) | [![npm](https://img.shields.io/npm/v/ipfsd-ctl.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfsd-ctl/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfsd-ctl.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfsd-ctl) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfsd-ctl/master)](https://travis-ci.com/ipfs/js-ipfsd-ctl) | [![codecov](https://codecov.io/gh/ipfs/js-ipfsd-ctl/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfsd-ctl) | [Hugo Dias](mailto:mail@hugodias.me) |
| [`is-ipfs`](//github.com/ipfs/is-ipfs) | [![npm](https://img.shields.io/npm/v/is-ipfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/is-ipfs/releases) | [![Deps](https://david-dm.org/ipfs/is-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/is-ipfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/is-ipfs/master)](https://travis-ci.com/ipfs/is-ipfs) | [![codecov](https://codecov.io/gh/ipfs/is-ipfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/is-ipfs) | [Marcin Rataj](mailto:lidel@lidel.org) |
| [`aegir`](//github.com/ipfs/aegir) | [![npm](https://img.shields.io/npm/v/aegir.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/aegir/releases) | [![Deps](https://david-dm.org/ipfs/aegir.svg?style=flat-square)](https://david-dm.org/ipfs/aegir) | [![Travis CI](https://flat.badgen.net/travis/ipfs/aegir/master)](https://travis-ci.com/ipfs/aegir) | [![codecov](https://codecov.io/gh/ipfs/aegir/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/aegir) | [Hugo Dias](mailto:hugomrdias@gmail.com) |
| [`ipfs-repo-migrations`](//github.com/ipfs/js-ipfs-repo-migrations) | [![npm](https://img.shields.io/npm/v/ipfs-repo-migrations.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo-migrations/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-repo-migrations.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo-migrations) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-repo-migrations/master)](https://travis-ci.com/ipfs/js-ipfs-repo-migrations) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-repo-migrations/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-repo-migrations) | N/A |
| **libp2p** |
| [`libp2p`](//github.com/libp2p/js-libp2p) | [![npm](https://img.shields.io/npm/v/libp2p.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p/master)](https://travis-ci.com/libp2p/js-libp2p) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`peer-id`](//github.com/libp2p/js-peer-id) | [![npm](https://img.shields.io/npm/v/peer-id.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-id/releases) | [![Deps](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-peer-id/master)](https://travis-ci.com/libp2p/js-peer-id) | [![codecov](https://codecov.io/gh/libp2p/js-peer-id/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-peer-id) | [Vasco Santos](mailto:santos.vasco10@gmail.com) |
| [`peer-info`](//github.com/libp2p/js-peer-info) | [![npm](https://img.shields.io/npm/v/peer-info.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-info/releases) | [![Deps](https://david-dm.org/libp2p/js-peer-info.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-info) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-peer-info/master)](https://travis-ci.com/libp2p/js-peer-info) | [![codecov](https://codecov.io/gh/libp2p/js-peer-info/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-peer-info) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-crypto`](//github.com/libp2p/js-libp2p-crypto) | [![npm](https://img.shields.io/npm/v/libp2p-crypto.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-crypto/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-crypto.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-crypto) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-crypto/master)](https://travis-ci.com/libp2p/js-libp2p-crypto) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-crypto/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-crypto) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-keychain`](//github.com/libp2p/js-libp2p-keychain) | [![npm](https://img.shields.io/npm/v/libp2p-keychain.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-keychain/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-keychain.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-keychain) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-keychain/master)](https://travis-ci.com/libp2p/js-libp2p-keychain) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-keychain/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-keychain) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-circuit`](//github.com/libp2p/js-libp2p-circuit) | [![npm](https://img.shields.io/npm/v/libp2p-circuit.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-circuit/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-circuit.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-circuit) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-circuit/master)](https://travis-ci.com/libp2p/js-libp2p-circuit) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-circuit/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-circuit) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-floodsub`](//github.com/libp2p/js-libp2p-floodsub) | [![npm](https://img.shields.io/npm/v/libp2p-floodsub.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-floodsub/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-floodsub.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-floodsub) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-floodsub/master)](https://travis-ci.com/libp2p/js-libp2p-floodsub) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-floodsub/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-floodsub) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-gossipsub`](//github.com/ChainSafe/gossipsub-js) | [![npm](https://img.shields.io/npm/v/libp2p-gossipsub.svg?maxAge=86400&style=flat-square)](//github.com/ChainSafe/gossipsub-js/releases) | [![Deps](https://david-dm.org/ChainSafe/gossipsub-js.svg?style=flat-square)](https://david-dm.org/ChainSafe/gossipsub-js) | [![Travis CI](https://flat.badgen.net/travis/ChainSafe/gossipsub-js/master)](https://travis-ci.com/ChainSafe/gossipsub-js) | [![codecov](https://codecov.io/gh/ChainSafe/gossipsub-js/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ChainSafe/gossipsub-js) | [Cayman Nava](mailto:caymannava@gmail.com) |
| [`libp2p-kad-dht`](//github.com/libp2p/js-libp2p-kad-dht) | [![npm](https://img.shields.io/npm/v/libp2p-kad-dht.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-kad-dht/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-kad-dht.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-kad-dht) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-kad-dht/master)](https://travis-ci.com/libp2p/js-libp2p-kad-dht) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-kad-dht/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-kad-dht) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-mdns`](//github.com/libp2p/js-libp2p-mdns) | [![npm](https://img.shields.io/npm/v/libp2p-mdns.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-mdns/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-mdns.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-mdns) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-mdns/master)](https://travis-ci.com/libp2p/js-libp2p-mdns) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-mdns/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-mdns) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-bootstrap`](//github.com/libp2p/js-libp2p-bootstrap) | [![npm](https://img.shields.io/npm/v/libp2p-bootstrap.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-bootstrap/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-bootstrap.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-bootstrap) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-bootstrap/master)](https://travis-ci.com/libp2p/js-libp2p-bootstrap) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-bootstrap/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-bootstrap) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-secio`](//github.com/libp2p/js-libp2p-secio) | [![npm](https://img.shields.io/npm/v/libp2p-secio.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-secio/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-secio.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-secio) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-secio/master)](https://travis-ci.com/libp2p/js-libp2p-secio) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-secio/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-secio) | [Friedel Ziegelmayer](mailto:dignifiedquire@gmail.com) |
| [`libp2p-tcp`](//github.com/libp2p/js-libp2p-tcp) | [![npm](https://img.shields.io/npm/v/libp2p-tcp.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-tcp/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-tcp.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-tcp) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-tcp/master)](https://travis-ci.com/libp2p/js-libp2p-tcp) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-tcp/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-tcp) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-webrtc-star`](//github.com/libp2p/js-libp2p-webrtc-star) | [![npm](https://img.shields.io/npm/v/libp2p-webrtc-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-webrtc-star/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-webrtc-star/master)](https://travis-ci.com/libp2p/js-libp2p-webrtc-star) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-websocket-star`](//github.com/libp2p/js-libp2p-websocket-star) | [![npm](https://img.shields.io/npm/v/libp2p-websocket-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websocket-star/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-websocket-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websocket-star) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-websocket-star/master)](https://travis-ci.com/libp2p/js-libp2p-websocket-star) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-websocket-star/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-websocket-star) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-websockets`](//github.com/libp2p/js-libp2p-websockets) | [![npm](https://img.shields.io/npm/v/libp2p-websockets.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websockets/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-websockets.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websockets) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-websockets/master)](https://travis-ci.com/libp2p/js-libp2p-websockets) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-websockets/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-websockets) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`pull-mplex`](//github.com/libp2p/pull-mplex) | [![npm](https://img.shields.io/npm/v/pull-mplex.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/pull-mplex/releases) | [![Deps](https://david-dm.org/libp2p/pull-mplex.svg?style=flat-square)](https://david-dm.org/libp2p/pull-mplex) | [![Travis CI](https://flat.badgen.net/travis/libp2p/pull-mplex/master)](https://travis-ci.com/libp2p/pull-mplex) | [![codecov](https://codecov.io/gh/libp2p/pull-mplex/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/pull-mplex) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| **IPLD** |
| [`ipld`](//github.com/ipld/js-ipld) | [![npm](https://img.shields.io/npm/v/ipld.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld/releases) | [![Deps](https://david-dm.org/ipld/js-ipld.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld) | [![Travis CI](https://flat.badgen.net/travis/ipld/js-ipld/master)](https://travis-ci.com/ipld/js-ipld) | [![codecov](https://codecov.io/gh/ipld/js-ipld/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipld/js-ipld) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipld-dag-pb`](//github.com/ipld/js-ipld-dag-pb) | [![npm](https://img.shields.io/npm/v/ipld-dag-pb.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-pb/releases) | [![Deps](https://david-dm.org/ipld/js-ipld-dag-pb.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-pb) | [![Travis CI](https://flat.badgen.net/travis/ipld/js-ipld-dag-pb/master)](https://travis-ci.com/ipld/js-ipld-dag-pb) | [![codecov](https://codecov.io/gh/ipld/js-ipld-dag-pb/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipld/js-ipld-dag-pb) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipld-dag-cbor`](//github.com/ipld/js-ipld-dag-cbor) | [![npm](https://img.shields.io/npm/v/ipld-dag-cbor.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-cbor/releases) | [![Deps](https://david-dm.org/ipld/js-ipld-dag-cbor.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-cbor) | [![Travis CI](https://flat.badgen.net/travis/ipld/js-ipld-dag-cbor/master)](https://travis-ci.com/ipld/js-ipld-dag-cbor) | [![codecov](https://codecov.io/gh/ipld/js-ipld-dag-cbor/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipld/js-ipld-dag-cbor) | [Volker Mische](mailto:volker.mische@gmail.com) |
| **Multiformats** |
| [`multihashing`](//github.com/multiformats/js-multihashing) | [![npm](https://img.shields.io/npm/v/multihashing.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihashing/releases) | [![Deps](https://david-dm.org/multiformats/js-multihashing.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihashing) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-multihashing/master)](https://travis-ci.com/multiformats/js-multihashing) | [![codecov](https://codecov.io/gh/multiformats/js-multihashing/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multihashing) | [Hugo Dias](mailto:mail@hugodias.me) |
| [`mafmt`](//github.com/multiformats/js-mafmt) | [![npm](https://img.shields.io/npm/v/mafmt.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-mafmt/releases) | [![Deps](https://david-dm.org/multiformats/js-mafmt.svg?style=flat-square)](https://david-dm.org/multiformats/js-mafmt) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-mafmt/master)](https://travis-ci.com/multiformats/js-mafmt) | [![codecov](https://codecov.io/gh/multiformats/js-mafmt/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-mafmt) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`multiaddr`](//github.com/multiformats/js-multiaddr) | [![npm](https://img.shields.io/npm/v/multiaddr.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multiaddr/releases) | [![Deps](https://david-dm.org/multiformats/js-multiaddr.svg?style=flat-square)](https://david-dm.org/multiformats/js-multiaddr) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-multiaddr/master)](https://travis-ci.com/multiformats/js-multiaddr) | [![codecov](https://codecov.io/gh/multiformats/js-multiaddr/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multiaddr) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`multihashes`](//github.com/multiformats/js-multihash) | [![npm](https://img.shields.io/npm/v/multihashes.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihash/releases) | [![Deps](https://david-dm.org/multiformats/js-multihash.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihash) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-multihash/master)](https://travis-ci.com/multiformats/js-multihash) | [![codecov](https://codecov.io/gh/multiformats/js-multihash/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multihash) | [David Dias](mailto:daviddias@ipfs.io) |

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
> npm run test:cli

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

[Annotated version](https://user-images.githubusercontent.com/1211152/47606420-b6265780-da13-11e8-923b-b365a8534e0e.png)

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

<h1 align="center">
  <a href="https://ipfs.io"><img width="650px" src="https://ipfs.io/ipfs/QmQJ68PFMDdAsgCZvA1UVzzn18asVcf7HVvCDgpjiSCAse" alt="IPFS http client lib logo" /></a>
</h1>

<h3 align="center">The JavaScript HTTP client library for IPFS implementations.</h3>

<p align="center">
  <a href="http://ipn.io"><img src="https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square" /></a>
  <a href="http://ipfs.io/"><img src="https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square" /></a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square" /></a>
  <a href="https://waffle.io/ipfs/js-ipfs"><img src="https://img.shields.io/badge/pm-waffle-blue.svg?style=flat-square" /></a>
  <a href="https://github.com/ipfs/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg?style=flat-square"></a>
</p>

<p align="center">
  <a href="https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-http-client?ref=badge_small" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-http-client.svg?type=small"/></a>
  <a href="https://travis-ci.com/ipfs/js-ipfs-http-client"><img src="https://flat.badgen.net/travis/ipfs/js-ipfs-http-client" /></a>
  <a href="https://codecov.io/gh/ipfs/js-ipfs-http-client"><img src="https://img.shields.io/codecov/c/github/ipfs/js-ipfs-http-client/master.svg?style=flat-square"></a>
   <a href="https://bundlephobia.com/result?p=ipfs-http-client"><img src="https://flat.badgen.net/bundlephobia/minzip/ipfs-http-client"></a>
  <br>
  <a href="https://david-dm.org/ipfs/js-ipfs-http-client"><img src="https://david-dm.org/ipfs/js-ipfs-http-client.svg?style=flat-square" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square" /></a>
  <br>
</p>

> A client library for the IPFS HTTP API, implemented in JavaScript. This client library implements the [interface-ipfs-core](https://github.com/ipfs/interface-ipfs-core) enabling applications to change between an embedded js-ipfs node and any remote IPFS node without having to change the code. In addition, this client library implements a set of utility functions.

## Lead Maintainer

[Alan Shaw](http://github.com/alanshaw).

## Table of Contents

- [Install](#install)
  - [Running the daemon with the right port](#running-the-daemon-with-the-right-port)
  - [Importing the module and usage](#importing-the-module-and-usage)
  - [Importing a sub-module and usage](#importing-a-sub-module-and-usage)
  - [In a web browser through Browserify](#in-a-web-browser-through-browserify)
  - [In a web browser from CDN](#in-a-web-browser-from-cdn)
  - [CORS](#cors)
- [Usage](#usage)
  - [API Docs](#api)
  - [Callbacks and promises](#callbacks-and-promises)
- [Contribute](#contribute)
- [License](#license)

## Install

This module uses node.js, and can be installed through npm:

```bash
npm install --save ipfs-http-client
```

We support both the Current and Active LTS versions of Node.js. Please see [nodejs.org](https://nodejs.org/) for what these currently are.

### Running the daemon with the right port

To interact with the API, you need to have a local daemon running. It needs to be open on the right port. `5001` is the default, and is used in the examples below, but it can be set to whatever you need.

```sh
# Show the ipfs config API port to check it is correct
> ipfs config Addresses.API
/ip4/127.0.0.1/tcp/5001
# Set it if it does not match the above output
> ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
# Restart the daemon after changing the config

# Run the daemon
> ipfs daemon
```

### Importing the module and usage

```javascript
var ipfsClient = require('ipfs-http-client')

// connect to ipfs daemon API server
var ipfs = ipfsClient('localhost', '5001', { protocol: 'http' }) // leaving out the arguments will default to these values

// or connect with multiaddr
var ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

// or using options
var ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' })

// or specifying a specific API path
var ipfs = ipfsClient({ host: '1.1.1.1', port: '80', 'api-path': '/ipfs/api/v0' })
```

### Importing a sub-module and usage

```javascript
const bitswap = require('ipfs-http-client/src/bitswap')('/ip4/127.0.0.1/tcp/5001')

bitswap.wantlist(key, (err) => {
  // ...
})
```

### In a web browser

**through Browserify**

Same as in Node.js, you just have to [browserify](http://browserify.org) the code before serving it. See the browserify repo for how to do that.

See the example in the [examples folder](/examples/bundle-browserify) to get a boilerplate.

**through webpack**

See the example in the [examples folder](/examples/bundle-webpack) to get an idea on how to use `js-ipfs-http-client` with webpack.

**from CDN**

Instead of a local installation (and browserification) you may request a remote copy of IPFS API from [unpkg CDN](https://unpkg.com/).

To always request the latest version, use the following:

```html
<!-- loading the minified version -->
<script src="https://unpkg.com/ipfs-http-client/dist/index.min.js"></script>
<!-- loading the human-readable (not minified) version -->
<script src="https://unpkg.com/ipfs-http-client/dist/index.js"></script>
```

For maximum security you may also decide to:

* reference a specific version of IPFS API (to prevent unexpected breaking changes when a newer latest version is published)
* [generate a SRI hash](https://www.srihash.org/) of that version and use it to ensure integrity
* set the [CORS settings attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) to make anonymous requests to CDN

Example:

```html
<script src="https://unpkg.com/ipfs-http-client@9.0.0/dist/index.js"
integrity="sha384-5bXRcW9kyxxnSMbOoHzraqa7Z0PQWIao+cgeg327zit1hz5LZCEbIMx/LWKPReuB"
crossorigin="anonymous"></script>
```

CDN-based IPFS API provides the `IpfsHttpClient` constructor as a method of the global `window` object. Example:

```js
const ipfs = window.IpfsHttpClient('localhost', '5001')
```

If you omit the host and port, the client will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```js
const ipfs = window.IpfsHttpClient()
```

### CORS

In a web browser IPFS HTTP client (either browserified or CDN-based) might encounter an error saying that the origin is not allowed. This would be a CORS ("Cross Origin Resource Sharing") failure: IPFS servers are designed to reject requests from unknown domains by default. You can whitelist the domain that you are calling from by changing your ipfs config like this:

```console
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://example.com"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```

### Custom Headers

If you wish to send custom headers with each request made by this library, for example, the Authorization header. You can use the config to do so:

```js
const ipfs = ipfsClient({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  headers: {
    authorization: 'Bearer ' + TOKEN
  }
})
```

## Usage

### API

[![IPFS Core API Compatible](https://cdn.rawgit.com/ipfs/interface-ipfs-core/master/img/badge.svg)](https://github.com/ipfs/interface-ipfs-core)

> `js-ipfs-http-client` follows the spec defined by [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core), which concerns the interface to expect from IPFS implementations. This interface is a currently active endeavor. You can use it today to consult the methods available.

#### Files

- [Regular Files API](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md)
  - [`ipfs.add(data, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add)
  - [`ipfs.addPullStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addpullstream)
  - [`ipfs.addReadableStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addreadablestream)
  - [`ipfs.addFromStream(stream, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addfromstream)
  - [`ipfs.addFromFs(path, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addfromfs)
  - [`ipfs.addFromURL(url, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addfromurl)
  - [`ipfs.cat(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#cat)
  - [`ipfs.catPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#catpullstream)
  - [`ipfs.catReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#catreadablestream)
  - [`ipfs.get(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#get)
  - [`ipfs.getPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#getpullstream)
  - [`ipfs.getReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#getreadablestream)
  - [`ipfs.ls(ipfsPath, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#ls)
  - [`ipfs.lsPullStream(ipfsPath)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#lspullstream)
  - [`ipfs.lsReadableStream(ipfsPath)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#lsreadablestream)
- [MFS (mutable file system) specific](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#mutable-file-system)

  _Explore the Mutable File System through interactive coding challenges in our [ProtoSchool tutorial](https://proto.school/#/mutable-file-system/)._
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

- [block](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BLOCK.md)
  - [`ipfs.block.get(cid, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BLOCK.md#blockget)
  - [`ipfs.block.put(block, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BLOCK.md#blockput)
  - [`ipfs.block.stat(cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BLOCK.md#blockstat)

- [refs](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REFS.md)
  - [`ipfs.refs(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REFS.md#refs)
  - [`ipfs.refsReadableStream(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REFS.md#refsreadablestream)
  - [`ipfs.refsPullStream(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REFS.md#refspullstream)
  - [`ipfs.refs.local([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REFS.md#refslocal)
  - [`ipfs.refs.localReadableStream([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REFS.md#refslocalreadablestream)
  - [`ipfs.refs.localPullStream([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REFS.md#refslocalpullstream)

#### Graph

- [dag](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DAG.md)

  _Explore the DAG API through interactive coding challenges in our [ProtoSchool tutorial](https://proto.school/#/basics)._
  - [`ipfs.dag.get(cid, [path], [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DAG.md#dagget)
  - [`ipfs.dag.put(dagNode, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DAG.md#dagput)
  - [`ipfs.dag.tree(cid, [path], [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DAG.md#dagtree)

- [object](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md)
  - [`ipfs.object.data(multihash, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectdata)
  - [`ipfs.object.get(multihash, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectget)
  - [`ipfs.object.links(multihash, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectlinks)
  - [`ipfs.object.new([template], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectnew)
  - [`ipfs.object.patch.addLink(multihash, DAGLink, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectpatchaddlink)
  - [`ipfs.object.patch.appendData(multihash, data, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectpatchappenddata)
  - [`ipfs.object.patch.rmLink(multihash, DAGLink, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectpatchrmlink)
  - [`ipfs.object.patch.setData(multihash, data, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectpatchsetdata)
  - [`ipfs.object.put(obj, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectput)
  - [`ipfs.object.stat(multihash, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/OBJECT.md#objectstat)

- [pin](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md)
  - [`ipfs.pin.add(hash, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md#pinadd)
  - [`ipfs.pin.ls([hash], [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md#pinls)
  - [`ipfs.pin.rm(hash, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PIN.md#pinrm)

- refs
  - `ipfs.refs.local()`

#### Network

- [bootstrap](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BOOTSTRAP.md)
  - [`ipfs.bootstrap.add(addr, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BOOTSTRAP.md#bootstrapadd)
  - [`ipfs.bootstrap.list([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BOOTSTRAP.md#bootstraplist)
  - [`ipfs.bootstrap.rm(addr, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BOOTSTRAP.md#bootstraprm)

- [bitswap](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BITSWAP.md)
  - [`ipfs.bitswap.stat([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BITSWAP.md#bitswapstat)
  - [`ipfs.bitswap.wantlist([peerId])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BITSWAP.md#bitswapwantlist)
  - [`ipfs.bitswap.unwant(cid)`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/BITSWAP.md#bitswapunwant)

- [dht](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md)
  - [`ipfs.dht.findPeer(peerId, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtfindpeer)
  - [`ipfs.dht.findProvs(hash, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtfindprovs)
  - [`ipfs.dht.get(key, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtget)
  - [`ipfs.dht.provide(cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtprovide)
  - [`ipfs.dht.put(key, value, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md#dhtput)

- [pubsub](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PUBSUB.md)
  - [`ipfs.pubsub.ls(topic, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PUBSUB.md#pubsubls)
  - [`ipfs.pubsub.peers(topic, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PUBSUB.md#pubsubpeers)
  - [`ipfs.pubsub.publish(topic, data, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PUBSUB.md#pubsubpublish)
  - [`ipfs.pubsub.subscribe(topic, handler, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PUBSUB.md#pubsubsubscribe)
  - [`ipfs.pubsub.unsubscribe(topic, handler, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/PUBSUB.md#pubsubunsubscribe)

- [swarm](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/SWARM.md)
  - [`ipfs.swarm.addrs([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/SWARM.md#swarmaddrs)
  - [`ipfs.swarm.connect(addr, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/SWARM.md#swarmconnect)
  - [`ipfs.swarm.disconnect(addr, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/SWARM.md#swarmdisconnect)
  - [`ipfs.swarm.peers([options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/SWARM.md#swarmpeers)

- [name](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md)
  - [`ipfs.name.publish(addr, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepublish)
  - [`ipfs.name.pubsub.cancel(arg, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepubsubcancel)
  - [`ipfs.name.pubsub.state([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepubsubstate)
  - [`ipfs.name.pubsub.subs([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#namepubsubsubs)
  - [`ipfs.name.resolve(addr, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md#nameresolve)

#### Node Management

- [miscellaneous operations](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md)
  - [`ipfs.dns(domain, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#dns)
  - [`ipfs.id([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#id)
  - [`ipfs.ping(id, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#ping)
  - [`ipfs.pingPullStream(id, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#pingpullstream)
  - [`ipfs.pingReadableStream(id, [options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#pingreadablestream)
  - [`ipfs.stop([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#stop). Alias to `ipfs.shutdown`.
  - [`ipfs.version([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/MISCELLANEOUS.md#version)

- [config](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/CONFIG.md)
  - [`ipfs.config.get([key], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/CONFIG.md#configget)
  - [`ipfs.config.replace(config, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/CONFIG.md#configreplace)
  - [`ipfs.config.set(key, value, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/CONFIG.md#configset)

- [stats](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/STATS.md)
  - [`ipfs.stats.bitswap([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/STATS.md#statsbitswap)
  - [`ipfs.stats.bw([options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/STATS.md#statsbw)
  - [`ipfs.stats.bwPullStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/STATS.md#statsbwpullstream)
  - [`ipfs.stats.bwReadableStream([options])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/STATS.md#statsbwreadablestream)
  - [`ipfs.stats.repo([options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/STATS.md#statsrepo)

- log
  - `ipfs.log.level(subsystem, level, [options], [callback])`
  - `ipfs.log.ls([callback])`
  - `ipfs.log.tail([callback])`

- [repo](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REPO.md)
  - [`ipfs.repo.gc([options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REPO.md#repogc)
  - [`ipfs.repo.stat([options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REPO.md#repostat)
  - [`ipfs.repo.version([callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REPO.md#repoversion)

- [key](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md)
  - [`ipfs.key.export(name, password, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyexport)
  - [`ipfs.key.gen(name, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keygen)
  - [`ipfs.key.import(name, pem, password, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyimport)
  - [`ipfs.key.list([options, callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keylist)
  - [`ipfs.key.rename(oldName, newName, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyrename)
  - [`ipfs.key.rm(name, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#keyrm)

#### Instance utils

- `ipfs.getEndpointConfig()`

Call this on your client instance to return an object containing the `host`, `port`, `protocol` and `api-path`.

#### Static types and utils

Aside from the default export, `ipfs-http-client` exports various types and utilities that are included in the bundle:

- [`isIPFS`](https://www.npmjs.com/package/is-ipfs)
- [`Buffer`](https://www.npmjs.com/package/buffer)
- [`PeerId`](https://www.npmjs.com/package/peer-id)
- [`PeerInfo`](https://www.npmjs.com/package/peer-info)
- [`multiaddr`](https://www.npmjs.com/package/multiaddr)
- [`multibase`](https://www.npmjs.com/package/multibase)
- [`multicodec`](https://www.npmjs.com/package/multicodec)
- [`multihash`](https://www.npmjs.com/package/multihash)
- [`CID`](https://www.npmjs.com/package/cids)

These can be accessed like this, for example:

```js
const { CID } = require('ipfs-http-client')
// ...or from an es-module:
import { CID } from 'ipfs-http-client'
```

## Development

### Testing

We run tests by executing `npm test` in a terminal window. This will run both Node.js and Browser tests, both in Chrome and PhantomJS. To ensure that the module conforms with the [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core) spec, we run the batch of tests provided by the interface module, which can be found [here](https://github.com/ipfs/interface-ipfs-core/tree/master/js/src).

## Contribute

The js-ipfs-http-client is a work in progress. As such, there's a few things you can do right now to help out:

- **[Check out the existing issues](https://github.com/ipfs/js-ipfs-http-client/issues)**!
- **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
- **Add tests**. There can never be enough tests. Note that interface tests exist inside [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core/tree/master/js/src).
- **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

**Want to hack on IPFS?**

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## Historical context

This module started as a direct mapping from the go-ipfs cli to a JavaScript implementation, although this was useful and familiar to a lot of developers that were coming to IPFS for the first time, it also created some confusion on how to operate the core of IPFS and have access to the full capacity of the protocol. After much consideration, we decided to create `interface-ipfs-core` with the goal of standardizing the interface of a core implementation of IPFS, and keep the utility functions the IPFS community learned to use and love, such as reading files from disk and storing them directly to IPFS.

## License

[MIT](LICENSE)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-http-client.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-http-client?ref=badge_large)

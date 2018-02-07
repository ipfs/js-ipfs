<h1 align="center">
  <a href="ipfs.io"><img width="650px" src="https://ipfs.io/ipfs/QmQJ68PFMDdAsgCZvA1UVzzn18asVcf7HVvCDgpjiSCAse" alt="IPFS http client lib logo" /></a>
</h1>

<h3 align="center">The JavaScript HTTP client library for IPFS implementations.</h3>

<p align="center">
  <a href="http://ipn.io"><img src="https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square" /></a>
  <a href="http://ipfs.io/"><img src="https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square" /></a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square" /></a>
  <a href="https://waffle.io/ipfs/js-ipfs"><img src="https://img.shields.io/badge/pm-waffle-blue.svg?style=flat-square" /></a>
  <a href="https://github.com/ipfs/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg"></a>
</p>

<p align="center">
  <a href="https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-api?ref=badge_small" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-api.svg?type=small"/></a>
  <a href="https://travis-ci.org/ipfs/js-ipfs-api"><img src="https://travis-ci.org/ipfs/js-ipfs-api.svg?branch=master" /></a>
  <a href="https://circleci.com/gh/ipfs/js-ipfs-api"><img src="https://circleci.com/gh/ipfs/js-ipfs-api.svg?style=svg" /></a>
  <a href="https://coveralls.io/github/ipfs/js-ipfs-api?branch=master"><img src="https://coveralls.io/repos/github/ipfs/js-ipfs-api/badge.svg?branch=master"></a>
  <br>
  <a href="https://david-dm.org/ipfs/js-ipfs-api"><img src="https://david-dm.org/ipfs/js-ipfs-api.svg?style=flat-square" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D6.0.0-orange.svg?style=flat-square" /></a>
  <br>
</p>

> A client library for the IPFS HTTP API, implemented in JavaScript. This client library implements the [interface-ipfs-core](https://github.com/ipfs/interface-ipfs-core) enabling applications to change between a embebed js-ipfs node and any remote IPFS node without having to change the code. In addition, this client library implements a set of utility functions.

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
> npm install --save ipfs-api
```

**Note:** ipfs-api requires Node.js v6 (LTS) or higher.

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
var ipfsAPI = require('ipfs-api')

// connect to ipfs daemon API server
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'}) // leaving out the arguments will default to these values

// or connect with multiaddr
var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

// or using options
var ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'})
```
### Importing a sub-module and usage
```javascript
const bitswap = require('ipfs-api/src/bitswap')('/ip4/127.0.0.1/tcp/5001')

bitswap.unwant(key, (err) => {
  // ...
}
```

### In a web browser through Browserify

Same as in Node.js, you just have to [browserify](http://browserify.org) the code before serving it. See the browserify repo for how to do that.

See the example in the [examples folder](/examples/bundle-browserify) to get a boilerplate.

### In a web browser through webpack

See the example in the [examples folder](/examples/bundle-webpack) to get an idea on how to use js-ipfs-api with webpack

### In a web browser from CDN

Instead of a local installation (and browserification) you may request a remote copy of IPFS API from [unpkg CDN](https://unpkg.com/).

To always request the latest version, use the following:

```html
<script src="https://unpkg.com/ipfs-api/dist/index.js"></script>
```

For maximum security you may also decide to:

* reference a specific version of IPFS API (to prevent unexpected breaking changes when a newer latest version is published)

* [generate a SRI hash](https://www.srihash.org/) of that version and use it to ensure integrity

* set the [CORS settings attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) to make anonymous requests to CDN

Example:

```html
<script src="https://unpkg.com/ipfs-api@9.0.0/dist/index.js"
integrity="sha384-5bXRcW9kyxxnSMbOoHzraqa7Z0PQWIao+cgeg327zit1hz5LZCEbIMx/LWKPReuB"
crossorigin="anonymous"></script>
```

CDN-based IPFS API provides the `IpfsApi` constructor as a method of the global `window` object. Example:

```
var ipfs = window.IpfsApi('localhost', '5001')
```

If you omit the host and port, the API will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```
var ipfs = window.IpfsApi()
```

### CORS

In a web browser IPFS API (either browserified or CDN-based) might encounter an error saying that the origin is not allowed. This would be a CORS ("Cross Origin Resource Sharing") failure: IPFS servers are designed to reject requests from unknown domains by default. You can whitelist the domain that you are calling from by changing your ipfs config like this:

```bash
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://example.com\"]"
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"
```

## Usage

### API

[![](https://github.com/ipfs/interface-ipfs-core/raw/master/img/badge.png)](https://github.com/ipfs/interface-ipfs-core)

> `js-ipfs-api` follows the spec defined by [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core), which concerns the interface to expect from IPFS implementations. This interface is a currently active endeavor. You can use it today to consult the methods available.

#### `Files`

- [files](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md)
  - [`ipfs.files.add(data, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#add). Alias to `ipfs.add`.
  - [`ipfs.files.addReadableStream([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#addreadablestream)
  - [`ipfs.files.addPullStream([options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#addpullstream)
  - [`ipfs.files.cat(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#cat). Alias to `ipfs.cat`.
  - [`ipfs.files.catReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#catreadablestream)
  - [`ipfs.files.catPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#catpullstream)  
  - [`ipfs.files.get(ipfsPath, [options], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#get). Alias to `ipfs.get`.
  - [`ipfs.files.getReadableStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#getreadablestream)
  - [`ipfs.files.getPullStream(ipfsPath, [options])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#getpullstream)  
  - [`ipfs.ls(ipfsPath, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#ls)
  - [MFS (mutable file system) specific](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#mutable-file-system)
    - [`ipfs.files.cp([from, to], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#cp)
    - [`ipfs.files.mkdir(path, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#mkdir)
    - [`ipfs.files.stat(path, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#stat)
    - [`ipfs.files.rm(path, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#rm)
    - [`ipfs.files.read(path, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#read)
    - [`ipfs.files.write(path, content, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#write)
    - [`ipfs.files.mv([from, to], [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#mv)
    - [`ipfs.files.ls([path, options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#ls-1)
    - [`ipfs.files.flush([path, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/FILES.md#flush)

- [block](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md)
  - [`ipfs.block.get(cid, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#get)
  - [`ipfs.block.put(block, cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#put)
  - [`ipfs.block.stat(cid, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/BLOCK.md#stat)

#### `Graph`

- [dag (not implemented, yet!)](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DAG.md)
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
- [pin](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)
  - [`ipfs.pin.add()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PIN.md#add)
  - [`ipfs.pin.rm()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PIN.md#rm)
  - [`ipfs.pin.ls()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PIN.md#ls)
- [refs](https://github.com/ipfs/interface-ipfs-core/tree/master/API/refs)
  - [`ipfs.refs.local()`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/refs#local)


#### `Network`

- [bootstrap](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)
  - `ipfs.bootstrap.list`
  - `ipfs.bootstrap.add`
  - `ipfs.bootstrap.rm`
  
- [bitswap](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)
  - `ipfs.bitswap.wantlist()`
  - `ipfs.bitswap.stat()`
  - `ipfs.bitswap.unwant()`
  
- [dht](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/)
  - [`ipfs.dht.findprovs()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DHT.md#findprovs)
  - [`ipfs.dht.get()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DHT.md#get)
  - [`ipfs.dht.put()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/DHT.md#put)
  
- [pubsub](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md)
  - [`ipfs.pubsub.subscribe(topic, options, handler, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubsubscribe)
  - [`ipfs.pubsub.unsubscribe(topic, handler)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubunsubscribe)
  - [`ipfs.pubsub.publish(topic, data, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubpublish)
  - [`ipfs.pubsub.ls(topic, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubls)
  - [`ipfs.pubsub.peers(topic, callback)`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/PUBSUB.md#pubsubpeers)
  
- [swarm](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md)
  - [`ipfs.swarm.addrs([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#addrs)
  - [`ipfs.swarm.connect(addr, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#connect)
  - [`ipfs.swarm.disconnect(addr, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#disconnect)
  - [`ipfs.swarm.peers([opts] [, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/SWARM.md#peers)
  
- [name](https://github.com/ipfs/interface-ipfs-core/tree/master/API/name)
  - [`ipfs.name.publish(addr, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/NAME.md#publish)
  - [`ipfs.name.resolve(addr, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/NAME.md#resolve)

#### `Node Management`

- [miscellaneous operations](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md)
  - [`ipfs.id([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#id)
  - [`ipfs.version([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#version)
  - [`ipfs.ping()`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#ping)
  - [`ipfs.dns(domain, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#dns)
  - [`ipfs.stop([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/MISCELLANEOUS.md#stop). Alias to `ipfs.shutdown`.
  
- [config](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md)
  - [`ipfs.config.get([key, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configget)
  - [`ipfs.config.set(key, value, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configset)
  - [`ipfs.config.replace(config, [callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/CONFIG.md#configreplace)
  
- [stats](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md)
  - [`ipfs.stats.bitswap([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#bitswap)
  - [`ipfs.stats.bw([options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#bw)
  - [`ipfs.stats.repo([options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/STATS.md#repo)
  
- log
  - `ipfs.log.ls([callback])`
  - `ipfs.log.tail([callback])`
  - `ipfs.log.level(subsystem, level, [options, callback])`

- [repo](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md)
  - [`ipfs.repo.gc([options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md#gc)
  - [`ipfs.repo.stat([options, callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md#stat)
  - [`ipfs.repo.version([callback])`](https://github.com/ipfs/interface-ipfs-core/tree/master/SPEC/REPO.md#version)
  
- [key](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md)
  - [`ipfs.key.gen(name, [options, callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#javascript---ipfskeygenname-options-callback)
  - [`ipfs.key.list([options, callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#javascript---ipfskeylistcallback)
  - [`ipfs.key.rm(name, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#javascript---ipfskeyrmname-callback)
  - [`ipfs.key.rename(oldName, newName, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#javascript---ipfskeyrenameoldname-newname-callback)
  - [`ipfs.key.export(name, password, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#javascript---ipfskeyexportname-password-callback)
  - [`ipfs.key.import(name, pem, password, [callback])`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/KEY.md#javascript---ipfskeyimportname-pem-password-callback)

#### `Pubsub Caveat` 

**Currently, the [PubSub API only works in Node.js envinroment](https://github.com/ipfs/js-ipfs-api/issues/518)**

We currently don't support pubsub when run in the browser, and we test it with separate set of tests to make sure if it's being used in the browser, pubsub errors.

More info: https://github.com/ipfs/js-ipfs-api/issues/518

This means:
- You can use pubsub from js-ipfs-api in Node.js
- You can use pubsub from js-ipfs-api in Electron
  (when js-ipfs-api is ran in the main process of Electron)
- You can't use pubsub from js-ipfs-api in the browser
- You can't use pubsub from js-ipfs-api in Electron's
  renderer process
- You can use pubsub from js-ipfs in the browsers
- You can use pubsub from js-ipfs in Node.js
- You can use pubsub from js-ipfs in Electron
  (in both the main process and the renderer process)
- See https://github.com/ipfs/js-ipfs for details on
  pubsub in js-ipfs

#### `Utility functions`

Adding to the methods defined by [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core), `js-ipfs-api` exposes a set of extra utility methods. These utility functions are scoped behind the `ipfs.util`.

Complete documentation for these methods is coming with: https://github.com/ipfs/js-ipfs-api/pull/305

##### Add files or entire directories from the FileSystem to IPFS

> `ipfs.util.addFromFs(path, option, callback)`

Reads a file or folder from `path` on the filesystem  and adds it to IPFS. Options:
- **recursive**: If `path` is a directory, use option `{ recursive: true }` to add the directory and all its sub-directories.
  - **ignore**: To exclude fileglobs from the directory, use option `{ ignore: ['ignore/this/folder/**', 'and/this/file'] }`.
  - **hidden**: hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`. 

```JavaScript
ipfs.util.addFromFs('path/to/a/folder', { recursive: true , ignore: ['subfolder/to/ignore/**']}, (err, result) => {
  if (err) { throw err }
  console.log(result)
})
```

`result` is an array of objects describing the files that were added, such as:

```
[
  {
    path: 'test-folder',
    hash: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6',
    size: 2278
  },
  // ...
]
```

##### Add a file from a URL to IPFS

> `ipfs.util.addFromURL(url, callback)`

```JavaScript
ipfs.util.addFromURL('http://example.com/', (err, result) => {
  if (err) {
    throw err
  }
  console.log(result)
})

```

##### Add a file from a stream to IPFS

> `ipfs.util.addFromStream(stream, callback)`

This is very similar to `ipfs.files.add({path:'', content: stream})`. It is like the reverse of cat

```JavaScript
ipfs.util.addFromStream(<readable-stream>, (err, result) => {
  if (err) {
    throw err
  }
  console.log(result)
})
```

### Callbacks and Promises

If you do not pass in a callback all API functions will return a `Promise`. For example:

```js
ipfs.id()
  .then((id) => {
    console.log('my id is: ', id)
  })
  .catch((err) => {
    console.log('Fail: ', err)
  })
```

This relies on a global `Promise` object. If you are in an environment where that is not yet available you need to bring your own polyfill.

## Development

### Testing

We run tests by executing `npm test` in a terminal window. This will run both Node.js and Browser tests, both in Chrome and PhantomJS. To ensure that the module conforms with the [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core) spec, we run the batch of tests provided by the interface module, which can be found [here](https://github.com/ipfs/interface-ipfs-core/tree/master/src).

## Contribute

The js-ipfs-api is a work in progress. As such, there's a few things you can do right now to help out:

* **[Check out the existing issues](https://github.com/ipfs/js-ipfs-api/issues)**!
* **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
* **Add tests**. There can never be enough tests. Note that interface tests exist inside [`interface-ipfs-core`](https://github.com/ipfs/interface-ipfs-core/tree/master/src).
* **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

**Want to hack on IPFS?**

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## Historical context

This module started as a direct mapping from the go-ipfs cli to a JavaScript implementation, although this was useful and familiar to a lot of developers that were coming to IPFS for the first time, it also created some confusion on how to operate the core of IPFS and have access to the full capacity of the protocol. After much consideration, we decided to create `interface-ipfs-core` with the goal of standardizing the interface of a core implementation of IPFS, and keep the utility functions the IPFS community learned to use and love, such as reading files from disk and storing them directly to IPFS.

## License

[MIT](LICENSE)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-api.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-api?ref=badge_large)

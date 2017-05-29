# interface-ipfs-core

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A test suite and interface you can use to implement a IPFS core interface.

## Table of Contents

- [Background](#background)
  - [Modules that implement the interface](#modules-that-implement-the-interface)
  - [Badge](#badge)
- [Install](#install)
- [Usage](#usage)
  - [Node.js](#nodejs)
  - [Go](#go)
- [API](#api)
- [Contribute](#contribute)
  - [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Background

The primary goal of this module is to define and ensure that both IPFS core implementations and their respective HTTP client libraries offer the same interface, so that developers can quickly change between a local and a remote node without having to change their applications. In addition to the definition of the expected interface, this module offers a suite of tests that can be run in order to check if the interface is used as described.

The API is presented with both Node.js and Go primitives. However, there are no actual limitations keeping it from being extended for any other language, pushing forward cross compatibility and interoperability through different stacks.

### Modules that implement the interface

- **WIP** [JavaScript IPFS implementation](https://github.com/ipfs/js-ipfs)
- **WIP** [JavaScript ipfs-api](https://github.com/ipfs/js-ipfs-api)
- Soon™, go-ipfs, go-ipfs-api, java-ipfs-api, python-ipfs-api and others will implement it as well.

Send in a PR if you find or write one!

### Badge

Include this badge in your readme if you make a new module that implements
interface-ipfs-core API.

![](/img/badge.png)

## Install

In JavaScript land:
```js
npm install interface-ipfs-core
```

In Go land:

```go
# Not available
```

## Usage

### Node.js

Install `interface-ipfs-core` as one of the dependencies of your project and as a test file. Then, using `mocha` (for Node.js) or a test runner with compatible API, do:

```
var test = require('interface-ipfs-core')

var common = {
  setup: function (cb) {
    cb(null, IPFSFactory)
  },
  teardown: function (cb) {
    cb()
  }
}

// use all of the test suits
test.all(common)
```

### Go

> [WIP](https://github.com/ipfs/interface-ipfs-core/issues/66)

## API

In order to be considered "valid", an IPFS core implementation  must expose the API described in [/API](/API). You can also use this loose spec as documentation for consuming the core APIs. Here is an outline of the contents of that directory:

- [bitswap (not spec'ed yet)](/API/bitswap)
- [block](/API/block)
  - [`block.get`](/API/block#get)
  - [`block.put`](/API/block#put)
  - [`block.stat`](/API/block#stat)
- [bootstrap](/API/bootstrap)
- [config](/API/config)
  - [`config.get`](/API/config#get)
  - [`config.set`](/API/config#set)
  - [`config.replace`](/API/config#replace)
- [dag](/API/dag)
  - [`dag.put`](/API/dag#dagput)
  - [`dag.get`](/API/dag#dagget)
  - [`dag.tree`](/API/dag#dagtree)
- [dht (not spec'ed yet)](/API/dht)
- [files](/API/files)
  - [`add`](/API/files#add)
  - [`createAddStream`](/files#createaddstream)
  - [`get`](/API/files#get)
  - [`cat`](/API/files#cat)
- [generic operations](/API/generic)
  - [`id`](/API/generic#id)
  - [`version`](/API/generic#version)
- [object](/API/object)
  - [`object.new`](/API/object#objectnew)
  - [`object.put`](/API/object#objectput)
  - [`object.get`](/API/object#objectget)
  - [`object.data`](/API/object#objectdata)
  - [`object.links`](/API/object#objectlinks)
  - [`object.stat`](/API/object#objectstat)
  - [`object.patch`](/API/object#objectpatch)
    - [`object.patch.addLink`](/API/object#objectpatchaddlink)
    - [`object.patch.rmLink`](/API/object#objectpatchrmlink)
    - [`object.patch.appendData`](/API/object#objectpatchappenddata)
    - [`object.patch.setData`](/API/object#objectpatchsetdata)
- [pin](/API/pin)
  - [`pin.add`](/API/pin#add)
  - [`pin.ls`](/API/pin#ls)
  - [`pin.rm`](/API/pin#rm)
- [pubsub](/API/pubsub)
  - [`pubsub.subscribe`](/API/pubsub#pubsubsubscribe)
  - [`pubsub.unsubscribe`](/API/pubsub#pubsubunsubscribe)
  - [`pubsub.publish`](/API/pubsub#pubsubpublish)
  - [`pubsub.ls`](/API/pubsub#pubsubls)
  - [`pubsub.peers`](/API/pubsub#pubsubpeers)
- [repo (not spec'ed yet)](/API/repo)
- [swarm](/API/swarm)
  - [`swarm.addrs`](/API/swarm#addrs)
  - [`swarm.connect`](/API/swarm#connect)
  - [`swarm.disconnect`](/API/swarm#disconnect)
  - [`swarm.peers`](/API/swarm#peers)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/interface-ipfs-core/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT

[UnixFS]: https://github.com/ipfs/specs/tree/master/unixfs

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
  - [JavaScript](#nodejs)
  - [Go](#go)
- [API](#api)
- [Contribute](#contribute)
  - [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Background

The primary goal of this module is to define and ensure that both IPFS core implementations and their respective HTTP client libraries offer the same interface, so that developers can quickly change between a local and a remote node without having to change their applications. In addition to the definition of the expected interface, this module offers a suite of tests that can be run in order to check if the interface is used as described.

The API is presented with both Node.js and Go primitives. However, there are no actual limitations keeping it from being extended for any other language, pushing forward cross compatibility and interoperability through different stacks.

### Modules that implement the interface

- [JavaScript IPFS implementation](https://github.com/ipfs/js-ipfs)
- [JavaScript IPFS HTTP Client Library](https://github.com/ipfs/js-ipfs-api)
- Soon™, go-ipfs, go-ipfs-api, java-ipfs-api, python-ipfs-api and others will implement it as well.

Send in a PR if you find or write one!

### Badge

Include this badge in your readme if you make a new module that implements interface-ipfs-core API.

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

### JavaScript

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

- **Files**
  - [files](/SPEC/files.md)
    - [`add`](/SPEC/files.md#add)
    - [`createAddStream`](/SPEC/files.md#createaddstream)
    - [`get`](/SPEC/files.md#get)
    - [`cat`](/SPEC/files.md#cat)
  - [repo (not spec'ed yet)](/SPEC/repo)
  - [block](/SPEC/block.md)
    - [`block.get`](/SPEC/block.md#get)
    - [`block.put`](/SPEC/block.md#put)
    - [`block.stat`](/SPEC/block.md#stat)
- **Graph**
  - [dag](/SPEC/dag.md)
    - [`dag.put`](/SPEC/dag.md#dagput)
    - [`dag.get`](/SPEC/dag.md#dagget)
    - [`dag.tree`](/SPEC/dag.md#dagtree)
  - [object](/SPEC/object.md)
    - [`object.new`](/SPEC/object.md#objectnew)
    - [`object.put`](/SPEC/object.md#objectput)
    - [`object.get`](/SPEC/object.md#objectget)
    - [`object.data`](/SPEC/object.md#objectdata)
    - [`object.links`](/SPEC/object.md#objectlinks)
    - [`object.stat`](/SPEC/object.md#objectstat)
    - [`object.patch`](/SPEC/object.md#objectpatch)
      - [`object.patch.addLink`](/SPEC/object.md#objectpatchaddlink)
      - [`object.patch.rmLink`](/SPEC/object.md#objectpatchrmlink)
      - [`object.patch.appendData`](/SPEC/object.md#objectpatchappenddata)
      - [`object.patch.setData`](/SPEC/object.md#objectpatchsetdata)
  - [pin](/SPEC/pin.md)
    - [`pin.add`](/SPEC/pin.md#add)
    - [`pin.ls`](/SPEC/pin.md#ls)
    - [`pin.rm`](/SPEC/pin.md#rm)
- **Network**
  - [bootstrap](/SPEC/bootstrap.md)
  - [bitswap (not spec'ed yet)](/SPEC/bitswap.md)
  - [dht (not spec'ed yet)](/SPEC/dht.md)
  - [pubsub](/SPEC/pubsub.md)
    - [`pubsub.subscribe`](/SPEC/pubsub.md#pubsubsubscribe)
    - [`pubsub.unsubscribe`](/SPEC/pubsub.md#pubsubunsubscribe)
    - [`pubsub.publish`](/SPEC/pubsub.md#pubsubpublish)
    - [`pubsub.ls`](/SPEC/pubsub.md#pubsubls)
    - [`pubsub.peers`](/SPEC/pubsub.md#pubsubpeers)
  - [swarm](/SPEC/swarm.md)
    - [`swarm.addrs`](/SPEC/swarm.md#addrs)
    - [`swarm.connect`](/SPEC/swarm.md#connect)
    - [`swarm.disconnect`](/SPEC/swarm.md#disconnect)
    - [`swarm.peers`](/SPEC/swarm.md#peers)
- **Node Management**
  - [Miscellabeous](/SPEC/miscellaneous.md)
    - [`id`](/SPEC/generic.md#id)
    - [`version`](/SPEC/generic.md#version)
  - [config](/SPEC/config.md)
    - [`config.get`](/SPEC/config.md#get)
    - [`config.set`](/SPEC/config.md#set)
    - [`config.replace`](/SPEC/config.md#replace)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/interface-ipfs-core/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT

[UnixFS]: https://github.com/ipfs/specs/tree/master/unixfs

interface-ipfs-core
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement the IPFS Core API.

The primary goal of this module is to define and ensure that both IPFS core implementations and their respective HTTP client libraries offer the same interface, so that developers can quickly change between a local and a remote node without having to change their applications. In addition to the definition of the expected interface, this module offers a suite of tests that can be run in order to check if the interface is used as described.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

# Modules that implement the interface

- [JavaScript IPFS implementation](https://github.com/ipfs/js-ipfs)
- [JavaScript ipfs-api](https://github.com/ipfs/js-ipfs-api)
- Soon, go-ipfs, go-ipfs-api, java-ipfs-api, python-ipfs-api and others will implement it as well.

Send a PR to add a new one if you happen to find or write one.

# Badge

Include this badge in your readme if you make a new module that uses interface-stream-muxer API.

![](/img/badge.png)

# How to use the battery tests

## Node.js

Install interface-ipfs-core as one of the dependencies of your project and as a test file, using `mocha` (for Node.js) or a test runner with compatible API, do:

```
var test = require('interface-ipfs-core')

var common = {
  setup: function (cb) {
    cb(null, yourIPFSInstance)
  },
  teardown: function (cb) {
    cb()
  }
}

// use all of the test suits
test.all(common)
```

## Go

> WIP

# API

A valid (read: that follows this interface) IPFS core implementation, must expose the following API.

## Object

### `object.new`

> Create a new MerkleDAG node, using a specific layout. Caveat: So far, only UnixFS object layouts are supported.

##### `Go` 

**WIP**

##### `JavaScript` - ipfs.object.new(layout, callback)

`layout` is the MerkleDAG node type, it can be: `null`, `unixfs-dir`, `unixfs-raw`, `unixfs-file`, `unixfs-metadata`, `unixfs-symlink`.

`callback` that must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode](https://github.com/vijayee/js-ipfs-merkle-dag/blob/master/src/dag-node.js)

If no `callback` is passed, a promise is returned.

### `object.put`

> DESCRIPTION

##### `Go` 

**WIP**

##### `JavaScript` - ipfs.object.put

### `object.get`

> DESCRIPTION

##### `Go` 

**WIP**

##### `JavaScript` - ipfs.object.get

### `object.data`

> DESCRIPTION

##### `Go` 

**WIP**

##### `JavaScript` - ipfs.object.data

### `object.links`

> DESCRIPTION

##### `Go` 

**WIP**

##### `JavaScript` - ipfs.object.links

### `object.stat`

> DESCRIPTION

##### `Go` 

**WIP**

##### `JavaScript` - ipfs.object.stat

### `object.patch`

> `object.patch` exposes the available patch calls.

#### `object.patch.addLink`

> DESCRIPTION

##### `Go`

**WIP**

##### `JavaScript` - ipfs.object.patch.addLink


#### `object.patch.rmLink`

> DESCRIPTION

##### `Go`

**WIP**

##### `JavaScript` - ipfs.object.patch.rmLink

#### `object.patch.appendData`

> DESCRIPTION

##### `Go`

**WIP**

##### `JavaScript` - ipfs.object.patch.appendData

#### `object.patch.setData`

> DESCRIPTION

##### `Go` 

**WIP**

##### `JavaScript` - ipfs.object.patch.setData


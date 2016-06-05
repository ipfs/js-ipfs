interface-ipfs-core
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement the IPFS Core API.

The primary goal of this module is to define and ensure that both IPFS core implementations and their respective HTTP client libraries offer the same interface, so that developers can quickly change between a local and a remote node without having to change their applications. In addition to the definition of the expected interface, this module offers a suite of tests that can be run in order to check if the interface is used as described.

The API is presented with both Node.js and Go primitives. However, there are no actual limitations keeping it from being extended for any other language, pushing forward cross compatibility and interoperability through different stacks.

# Modules that implement the interface

- **WIP** [JavaScript IPFS implementation](https://github.com/ipfs/js-ipfs)
- **WIP** [JavaScript ipfs-api](https://github.com/ipfs/js-ipfs-api)
- Soon, go-ipfs, go-ipfs-api, java-ipfs-api, python-ipfs-api and others will implement it as well.

Send in a PR if you find or write one!

# Badge

Include this badge in your readme if you make a new module that implements
interface-ipfs-core API.

![](/img/badge.png)

# How to use the battery of tests

## Node.js

Install `interface-ipfs-core` as one of the dependencies of your project and as a test file. Then, using `mocha` (for Node.js) or a test runner with compatible API, do:

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

## Files

### `add`

> Add files and data to IPFS.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.add(data, [callback])

Where `data` may be

- an array of objects, each of the form
```js
{
  path: '/tmp/myfile.txt',
  content: (Buffer or Readable stream)
}
```
- a `Buffer` instance
- a `Readable` stream

`callback` must follow `function (err, res) {}` signature, where `err` is an
error if the operation was not successful. `res` will be an array of

```js
{
  path: '/tmp/myfile.txt',
  node: DAGNode
}
```

If no `callback` is passed, a promise is returned.

Example:
```js
var files = [
  {
    path: '/tmp/myfile.txt',
    content: (Buffer or Readable stream)
  }
]
ipfs.files.add(files, function (err, files) {
  // 'files' will be an array of objects
})
```


### `createAddStream`

> Add files and data to IPFS using a transform stream.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.createAddStream([callback])

Provides a Transform stream, where objects can be written of the forms

```js
{
  path: '/tmp/myfile.txt',
  content: (Buffer or Readable stream)
}
```

`callback` must follow `function (err, stream) {}` signature, where `err` is an
error if the operation was not successful. `stream` will be a Transform stream,
to which tuples like the above two object formats can be written and [DAGNode][]
objects will be outputted.

If no `callback` is passed, a promise is returned.

```js
ipfs.files.createAddStream(function (err, stream) {
  stream.on('data', function (file) {
    // 'file' will be of the form
    // {
    //   path: '/tmp/myfile.txt',
    //   node: DAGNode
    // }
  })

  stream.write({path: <path to file>, content: <buffer or readable stream>})
  // write as many as you want

  stream.end()
})
```



## Object

### `object.new`

> Create a new MerkleDAG node, using a specific layout. Caveat: So far, only UnixFS object layouts are supported.

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.new([callback])

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][]

If no `callback` is passed, a [promise][] is returned.





### `object.put`

> Store an MerkleDAG node.

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.put(obj, [options, callback])

`obj` is the MerkleDAG Node to be stored. Can of type:

- Object, with format `{ Data: <data>, Links: [] }`
- Buffer, requiring that the encoding is specified on the options. If no encoding is specified, Buffer is treated as the Data field
- [DAGNode][]

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of the Buffer (json, yml, etc), if passed a Buffer.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][]

If no `callback` is passed, a [promise][] is returned.





### `object.get`

> Fetch a MerkleDAG node

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.get(multihash, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][]

If no `callback` is passed, a [promise][] is returned.

### `object.data`

> Returns the Data field of an object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.data(multihash, [options, callback])
`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, data) {}` signature, where `err` is an error if the operation was not successful and `data` is a Buffer with the data that the MerkleDAG node contained.

If no `callback` is passed, a [promise][] is returned.

### `object.links`

> Returns the Links field of an object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.links(multihash, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, links) {}` signature, where `err` is an error if the operation was not successful and `links` is an Array of [DAGLink](https://github.com/vijayee/js-ipfs-merkle-dag/blob/master/src/dag-node.js#L199-L203) objects.

If no `callback` is passed, a [promise][] is returned.





### `object.stat`

> Returns stats about an Object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.stat(multihash, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, stats) {}` signature, where `err` is an error if the operation was not successful and `stats` is an Object with following format:

```JavaScript
{
  Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  NumLinks: 0,
  BlockSize: 10,
  LinksSize: 2,
  DataSize: 8,
  CumulativeSize: 10
}
```

If no `callback` is passed, a [promise][] is returned.





### `object.patch`

> `object.patch` exposes the available patch calls.

#### `object.patch.addLink`

> Add a Link to an existing MerkleDAG Object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.addLink(multihash, DAGLink, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`DAGLink` is the new link to be added on the node that is identified by the `multihash`

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.





#### `object.patch.rmLink`

> Remove a Link from an existing MerkleDAG Object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.rmLink(multihash, DAGLink, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`DAGLink` is the link to be removed on the node that is identified by the `multihash`

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.





#### `object.patch.appendData`

> Append Data to the Data field of an existing node.

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.appendData(multihash, data, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to be appended to the existing node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.





#### `object.patch.setData`

> Reset the Data field of a MerkleDAG Node to new Data

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.setData(multihash, data, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to replace the existing Data on the node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.


[DAGNode]: https://github.com/vijayee/js-ipfs-merkle-dag
[multihash]: http://github.com/jbenet/multihash
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

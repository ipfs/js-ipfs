object API
==========

#### `object.new`

> Create a new MerkleDAG node, using a specific layout. Caveat: So far, only UnixFS object layouts are supported.

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.new([template][, callback])

`template` if defined, must be a string `unixfs-dir` and if that is passed, the created node will be an empty unixfs style directory.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][]

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
ipfs.object.new('unixfs-dir', (err, node) => {
  if (err) {
    throw err
  }
  console.log(node.toJSON().multihash)
  // Logs:
  // QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
})
```

A great source of [examples][] can be found in the tests for this API.

#### `object.put`

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

**Example:**

```JavaScript
const obj = {
  Data: new Buffer('Some data'),
  Links: []
}

ipfs.object.put(obj, (err, node) => {
  if (err) {
    throw err
  }
  console.log(node.toJSON().multihash)
  // Logs:
  // QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
})
```

A great source of [examples][] can be found in the tests for this API.

#### `object.get`

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

**Example:**

```JavaScript
const multihash = 'QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK'

ipfs.object.get(multihash, (err, node) => {
  if (err) {
    throw err
  }
  console.log(node.toJSON().multihash)
  // Logs:
  // QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
})
```

A great source of [examples][] can be found in the tests for this API.

#### `object.data`

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

**Example:**

```JavaScript
const multihash = 'QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK'

ipfs.object.data(multihash, (err, data) => {
  if (err) {
    throw err
  }
  console.log(data.toString())
  // Logs:
  // some data
```

A great source of [examples][] can be found in the tests for this API.

#### `object.links`

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

**Example:**

```JavaScript
const multihash = 'QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK'

ipfs.object.links(multihash, (err, links) => {
  if (err) {
    throw err
  }
  console.log(links)
  // Logs:
  // []
```

A great source of [examples][] can be found in the tests for this API.

#### `object.stat`

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

**Example:**

```JavaScript
const multihash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'

ipfs.object.stat(multihash, (err, stats) => {
  if (err) {
    throw err
  }
  console.log(stats)
  // Logs:
  // {
  //   Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  //   NumLinks: 0,
  //   BlockSize: 10,
  //   LinksSize: 2,
  //   DataSize: 8,
  //   CumulativeSize: 10
  // }
})
```

A great source of [examples][] can be found in the tests for this API.

#### `object.patch`

> `object.patch` exposes the available patch calls.

##### `object.patch.addLink`

> Add a Link to an existing MerkleDAG Object

###### `Go` **WIP**

###### `JavaScript` - ipfs.object.patch.addLink(multihash, DAGLink, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`DAGLink` is the new link to be added on the node that is identified by the `multihash`

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
ipfs.object.patch.addLink(node, {
  name: 'some-link'
  size: 10
  multihash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
}, (err, newNode) => {
  if (err) {
    throw err
  }
  // newNode is node with the added link
})
```

A great source of [examples][] can be found in the tests for this API.

##### `object.patch.rmLink`

> Remove a Link from an existing MerkleDAG Object

###### `Go` **WIP**

###### `JavaScript` - ipfs.object.patch.rmLink(multihash, DAGLink, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`DAGLink` is the link to be removed on the node that is identified by the `multihash`

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
```

A great source of [examples][] can be found in the tests for this API.

##### `object.patch.appendData`

> Append Data to the Data field of an existing node.

###### `Go` **WIP**

###### `JavaScript` - ipfs.object.patch.appendData(multihash, data, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to be appended to the existing node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
ipfs.object.patch.appendData(multihash, new Buffer('more data'), (err, node) => {
  if (err) {
    throw err
  }
})
```

A great source of [examples][] can be found in the tests for this API.

##### `object.patch.setData`

> Reset the Data field of a MerkleDAG Node to new Data

###### `Go` **WIP**

###### `JavaScript` - ipfs.object.patch.setData(multihash, data, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to replace the existing Data on the node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
ipfs.object.patch.setData(multihash, new Buffer('more data'), (err, node) => {
  if (err) {
    throw err
  }
})

```

A great source of [examples][] can be found in the tests for this API.

[DAGNode]: https://github.com/ipld/js-ipld-dag-pb
[multihash]: http://github.com/multiformats/multihash
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/object.js

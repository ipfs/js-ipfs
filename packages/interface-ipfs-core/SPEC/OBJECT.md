# Object API

* [object.new](#objectnew)
* [object.put](#objectput)
* [object.get](#objectget)
* [object.data](#objectdata)
* [object.links](#objectlinks)
* [object.stat](#objectstat)
* [object.patch.addLink](#objectpatchaddlink)
* [object.patch.rmLink](#objectpatchrmlink)
* [object.patch.appendData](#objectpatchappenddata)
* [object.patch.setData](#objectpatchsetdata)

#### `object.new`

> Create a new MerkleDAG node, using a specific layout. Caveat: So far, only UnixFS object layouts are supported.

##### `ipfs.object.new([template])`

`template` if defined, must be a string `unixfs-dir` and if that is passed, the created node will be an empty unixfs style directory.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID](https://github.com/ipfs/js-cid) instance |

**Example:**

```JavaScript
const cid = await ipfs.object.new('unixfs-dir')
console.log(cid.toString())
// Logs:
// QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
```

A great source of [examples][] can be found in the tests for this API.

#### `object.put`

> Store an MerkleDAG node.

##### `ipfs.object.put(obj, [options])`

`obj` is the MerkleDAG Node to be stored. Can of type:

- Object, with format `{ Data: <data>, Links: [] }`
- Buffer, requiring that the encoding is specified on the options. If no encoding is specified, Buffer is treated as the Data field
- [DAGNode][]

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of the Buffer (json, yml, etc), if passed a Buffer.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID](https://github.com/ipfs/js-cid) instance |

**Example:**

```JavaScript
const obj = {
  Data: new Buffer('Some data'),
  Links: []
}

const cid = await ipfs.object.put(obj)
console.log(cid.toString())
// Logs:
// QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
```

A great source of [examples][] can be found in the tests for this API.

#### `object.get`

> Fetch a MerkleDAG node

##### `ipfs.object.get(multihash, [options])`

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc` (`string`) - the encoding of multihash (base58, base64, etc), if any.
- `timeout` (`number`|`string`) - Throw an error if the request does not complete within the specified milliseconds timeout. If `timeout` is a string, the value is parsed as a [human readable duration](https://www.npmjs.com/package/parse-duration). There is no timeout by default.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<DAGNode>` | A MerkleDAG node of the type [DAGNode][] |

**Example:**

```JavaScript
const multihash = 'QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK'

const node = await ipfs.object.get(multihash)
console.log(node.data)
// Logs:
// some data
```

A great source of [examples][] can be found in the tests for this API.

#### `object.data`

> Returns the Data field of an object

##### `ipfs.object.data(multihash, [options])`
`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Buffer>` | An Promise that resolves to Buffer objects with the data that the MerkleDAG node contained |

**Example:**

```JavaScript
const cid = 'QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK'

const data = await ipfs.object.data(cid)
console.log(data.toString())
// Logs:
// some data
```

A great source of [examples][] can be found in the tests for this API.

#### `object.links`

> Returns the Links field of an object

##### `ipfs.object.links(multihash, [options])`

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An Array of [DAGLink](https://github.com/ipld/js-ipld-dag-pb/blob/master/src/dag-link/dagLink.js) objects |

**Example:**

```JavaScript
const multihash = 'Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E'

const links = await ipfs.object.links(multihash)
const hashes = links.map((link) => link.Hash.toString())
console.log(hashes)
// Logs:
// [
//   'QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ',
//   'QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R'
// ]
```

A great source of [examples][] can be found in the tests for this API.

#### `object.stat`

> Returns stats about an Object

##### `ipfs.object.stat(multihash, [options])`

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `timeout`, A timeout to pass to the IPFS daemon so the request expires after a certain amount of time without any response. NOTE: not yet supported in JS IPFS.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object representing the stats of the Object |

the returned object has the following format:

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

**Example:**

```JavaScript
const multihash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'

const stats = await ipfs.object.stat(multihash, {timeout: '10s'})
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
```

A great source of [examples][] can be found in the tests for this API.

#### `object.patch`

> `object.patch` exposes the available patch calls.

##### `object.patch.addLink`

> Add a Link to an existing MerkleDAG Object

###### `ipfs.object.patch.addLink(multihash, link, [options])`

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`link` is the new link to be added on the node that is identified by the `multihash`, can be passed as:
- `DAGLink`
- Object containing: name, cid and size properties

```js
const link = {
  name: 'Qmef7ScwzJUCg1zUSrCmPAz45m8uP5jU7SLgt2EffjBmbL',
  size: 37,
  cid: new CID('Qmef7ScwzJUCg1zUSrCmPAz45m8uP5jU7SLgt2EffjBmbL')
};
```

or

```js
const link = new DAGLink(name, size, multihash)
```

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |


**Example:**

```JavaScript
// cid is CID of the DAG node created by adding a link
const cid = await ipfs.object.patch.addLink(node, {
  name: 'some-link'
  size: 10
  cid: new CID('QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD')
})
```

A great source of [examples][] can be found in the tests for this API.

##### `object.patch.rmLink`

> Remove a Link from an existing MerkleDAG Object

###### `ipfs.object.patch.rmLink(multihash, link, [options])`

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`link` is the link to be removed on the node that is identified by the `multihash`, can be passed as:

- `DAGLink`

  ```js
  const link = new DAGLink(name, size, multihash)
  ```

- Object containing a `name` property

    ```js
    const link = {
      name: 'Qmef7ScwzJUCg1zUSrCmPAz45m8uP5jU7SLgt2EffjBmbL'
    };
    ```

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |

**Example:**

```JavaScript
// cid is CID of the DAG node created by removing a link
const cid = await ipfs.object.patch.rmLink(node, {
  name: 'some-link'
  size: 10
  cid: new CID('QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD')
})
```

A great source of [examples][] can be found in the tests for this API.

##### `object.patch.appendData`

> Append Data to the Data field of an existing node.

###### `ipfs.object.patch.appendData(multihash, data, [options])`

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to be appended to the existing node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |

**Example:**

```JavaScript
const cid = await ipfs.object.patch.appendData(multihash, new Buffer('more data'))
```

A great source of [examples][] can be found in the tests for this API.

##### `object.patch.setData`

> Reset the Data field of a MerkleDAG Node to new Data

###### `ipfs.object.patch.setData(multihash, data, [options])`

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to replace the existing Data on the node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |

**Example:**

```JavaScript
const cid = await ipfs.object.patch.setData(multihash, new Buffer('more data'))
```

A great source of [examples][] can be found in the tests for this API.

[CID]: https://github.com/multiformats/js-cid
[DAGNode]: https://github.com/ipld/js-ipld-dag-pb
[multihash]: http://github.com/multiformats/multihash
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/object

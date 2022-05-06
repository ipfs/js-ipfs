# Object API <!-- omit in toc -->

- [`ipfs.object.new([options])`](#ipfsobjectnewoptions)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.object.put(obj, [options])`](#ipfsobjectputobj-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.object.get(cid, [options])`](#ipfsobjectgetcid-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.object.data(cid, [options])`](#ipfsobjectdatacid-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.object.links(cid, [options])`](#ipfsobjectlinkscid-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)
- [`ipfs.object.stat(cid, [options])`](#ipfsobjectstatcid-options)
  - [Parameters](#parameters-5)
  - [Options](#options-5)
  - [Returns](#returns-5)
  - [Example](#example-5)
- [`ipfs.object.patch.addLink(cid, link, [options])`](#ipfsobjectpatchaddlinkcid-link-options)
  - [Parameters](#parameters-6)
  - [Options](#options-6)
  - [Returns](#returns-6)
  - [Example](#example-6)
  - [Notes](#notes)
- [`ipfs.object.patch.rmLink(cid, link, [options])`](#ipfsobjectpatchrmlinkcid-link-options)
  - [Parameters](#parameters-7)
  - [Options](#options-7)
  - [Returns](#returns-7)
  - [Example](#example-7)
  - [Notes](#notes-1)
- [`ipfs.object.patch.appendData(cid, data, [options])`](#ipfsobjectpatchappenddatacid-data-options)
  - [Parameters](#parameters-8)
  - [Options](#options-8)
  - [Returns](#returns-8)
  - [Example](#example-8)
- [`ipfs.object.patch.setData(multihash, data, [options])`](#ipfsobjectpatchsetdatamultihash-data-options)
  - [Parameters](#parameters-9)
  - [Options](#options-9)
  - [Returns](#returns-9)
  - [Example](#example-9)

## `ipfs.object.new([options])`

> Create a new MerkleDAG node, using a specific layout. Caveat: So far, only UnixFS object layouts are supported.

### Parameters

None.

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| template | `String` | If defined, must be a string `unixfs-dir` and if that is passed, the created node will be an empty unixfs style directory |
| recursive | `boolean` | `false` | Resolve until the result is not an IPNS name |
| nocache | `boolean` | `cache` | Do not use cached entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID](https://github.com/ipfs/js-cid) instance |

### Example

```JavaScript
const cid = await ipfs.object.new({
  template: 'unixfs-dir'
})
console.log(cid.toString())
// Logs:
// QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.object.put(obj, [options])`

> Store a MerkleDAG node.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| obj | `Object{ Data: <data>, Links: [] }`, `Uint8Array` or [DAGNode][] | The MerkleDAG Node to be stored |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| enc | `String` | `undefined` | The encoding of the Uint8Array (json, yml, etc), if passed a Uint8Array |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID](https://github.com/ipfs/js-cid) instance |

### Example

```JavaScript
const obj = {
  Data: new TextEncoder().encode('Some data'),
  Links: []
}

const cid = await ipfs.object.put(obj)
console.log(cid.toString())
// Logs:
// QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.object.get(cid, [options])`

> Fetch a MerkleDAG node

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | The returned [DAGNode][] will correspond to this CID |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<DAGNode>` | A MerkleDAG node of the type [DAGNode][] |

### Example

```JavaScript
const multihash = 'QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK'

const node = await ipfs.object.get(multihash)
console.log(node.Data)
// Logs:
// some data
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.object.data(cid, [options])`

> Returns the Data field of an object

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | The returned data will be from the [DAGNode][] that corresponds to this CID |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Uint8Array>` | An Promise that resolves to Uint8Array objects with the data that the MerkleDAG node contained |

### Example

```JavaScript
const cid = 'QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK'

const data = await ipfs.object.data(cid)
console.log(data.toString())
// Logs:
// some data
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.object.links(cid, [options])`

> Returns the Links field of an object

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | The returned [DAGLink][]s will be from the [DAGNode][] that corresponds to this CID |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An Array of [DAGLink](https://github.com/ipld/js-ipld-dag-pb/blob/master/src/dag-link/dagLink.js) objects |

### Example

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

## `ipfs.object.stat(cid, [options])`

> Returns stats about an Object

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | The returned stats will be from the [DAGNode][] that corresponds to this CID |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

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

### Example

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

## `ipfs.object.patch.addLink(cid, link, [options])`

> Add a Link to an existing MerkleDAG Object

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | Add a link to the [DAGNode][] that corresponds to this CID |
| link | [DAGLink][] | The link to add |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |

### Example

```JavaScript
// cid is CID of the DAG node created by adding a link
const cid = await ipfs.object.patch.addLink(node, {
  name: 'some-link',
  size: 10,
  cid: CID.parse('QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD')
})
```

A great source of [examples][] can be found in the tests for this API.

### Notes

The `DAGLink` to be added can also be passed as an object containing: `name`, `cid` and `size` properties:

```js
const link = {
  name: 'Qmef7ScwzJUCg1zUSrCmPAz45m8uP5jU7SLgt2EffjBmbL',
  size: 37,
  cid: CID.parse('Qmef7ScwzJUCg1zUSrCmPAz45m8uP5jU7SLgt2EffjBmbL')
};
```

or

```js
const link = new DAGLink(name, size, multihash)
```

## `ipfs.object.patch.rmLink(cid, link, [options])`

> Remove a Link from an existing MerkleDAG Object

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | Remove a link to the [DAGNode][] that corresponds to this CID |
| link | [DAGLink][] | The [DAGLink][] to remove |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |

### Example

```JavaScript
// cid is CID of the DAG node created by removing a link
const cid = await ipfs.object.patch.rmLink(node, {
  Name: 'some-link',
  Tsize: 10,
  Hash: CID.parse('QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD')
})
```

A great source of [examples][] can be found in the tests for this API.

### Notes

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

## `ipfs.object.patch.appendData(cid, data, [options])`

> Append Data to the Data field of an existing node

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | Add data to the [DAGNode][] that corresponds to this CID |
| data | `Uint8Array` | The data to append to the `.Data` field of the node |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |

### Example

```JavaScript
const cid = await ipfs.object.patch.appendData(multihash, new TextEncoder().encode('more data'))
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.object.patch.setData(multihash, data, [options])`

> Overwrite the Data field of a DAGNode with new Data

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | Replace data of the [DAGNode][] that corresponds to this CID |
| data | `Uint8Array` | The data to overwrite with |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | An instance of [CID][] representing the new DAG node that was created due to the operation |

### Example

```JavaScript
const cid = '/ipfs/Qmfoo'
const updatedCid = await ipfs.object.patch.setData(cid, new TextEncoder().encode('more data'))
```

A great source of [examples][] can be found in the tests for this API.

[CID]: https://github.com/multiformats/js-cid
[DAGNode]: https://github.com/ipld/js-ipld-dag-pb
[DAGLink]: https://github.com/ipld/js-ipld-dag-pb
[multihash]: http://github.com/multiformats/multihash
[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/object
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

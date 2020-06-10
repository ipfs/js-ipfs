# Block API <!-- omit in toc -->

- [`ipfs.block.get(cid, [options])`](#ipfsblockgetcid-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.block.put(block, [options])`](#ipfsblockputblock-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.block.rm(cid, [options])`](#ipfsblockrmcid-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.block.stat(cid, [options])`](#ipfsblockstatcid-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)

## `ipfs.block.get(cid, [options])`

> Get a raw IPFS block.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][], `String` or `Buffer` | A CID that corresponds to the desired block |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Block>` | A [Block][block] type object, containing both the data and the hash of the block |

### Example

```JavaScript
const block = await ipfs.block.get(cid)
console.log(block.data)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.block.put(block, [options])`

> Stores input as an IPFS block.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| block | A `Buffer` or [Block][] instance | The block or data to store |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| cid  | [CID][] | `undefined` | A CID to store the block under |
| format | `String` | `'dag-pb'` | The codec to use to create the CID |
| mhtype | `String` | `sha2-256` | The hashing algorithm to use to create the CID |
| mhlen | `Number` | | |
| version | `Number` | 0 |  The version to use to create the CID |
| pin | `boolean` | false |  If true, pin added blocks recursively |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

**Note:** If you pass a [`Block`][block] instance as the block parameter, you don't need to pass options, as the block instance will carry the CID value as a property.

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Block>` | A [Block][block] type object, containing both the data and the hash of the block |

### Example

```JavaScript
// Defaults
const buf = Buffer.from('a serialized object')

const block = await ipfs.block.put(buf)

console.log(block.data.toString())
// Logs:
// a serialized object
console.log(block.cid.toString())
// Logs:
// the CID of the object

// With custom format and hashtype through CID
const CID = require('cids')
const buf = Buffer.from('another serialized object')
const cid = new CID(1, 'dag-pb', multihash)

const block = await ipfs.block.put(blob, cid)

console.log(block.data.toString())
// Logs:
// a serialized object
console.log(block.cid.toString())
// Logs:
// the CID of the object
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.block.rm(cid, [options])`

> Remove one or more IPFS block(s).

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | A [CID][] or Array of [CID][]s | Blocks corresponding to the passed CID(s) will be removed |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| force | `boolean` | `false` | Ignores nonexistent blocks |
| quiet | `boolean` | `false | Write minimal output |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects containing hash and (potentially) error strings |

Each object yielded is of the form:

```js
{
  hash: string,
  error: string
}
```

Note: If an error string is present for a given object, the block with that hash was not removed and the string will contain the reason why, for example if the block was pinned.

### Example

```JavaScript
for await (const result of ipfs.block.rm(cid)) {
  console.log(result.hash)
}
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.block.stat(cid, [options])`

> Print information of a raw IPFS block.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | A [CID][] or Array of [CID][]s | The stats of the passed CID will be returned |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the block's info |

the returned object has the following keys:

```JavaScript
{
  key: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  size: 10
}
```

### Example

```JavaScript
const multihashStr = 'QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ'
const cid = new CID(multihashStr)

const stats = await ipfs.block.stat(cid)
console.log(stats)
// Logs:
// {
//   key: QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ,
//    size: 3739
// }
```

A great source of [examples][] can be found in the tests for this API.

[block]: https://github.com/ipfs/js-ipfs-block
[multihash]: https://github.com/multiformats/multihash
[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/block
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[cid]: https://www.npmjs.com/package/cids

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
| cid | [CID][], `String` or `Uint8Array` | A CID that corresponds to the desired block |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |
| preload | `boolean` | `false` |  Whether to preload all blocks created during this operation |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Uint8Array>` | A Uint8Array containing the data of the block |

### Example

```JavaScript
const block = await ipfs.block.get(cid)
console.log(block)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.block.put(block, [options])`

> Stores input as an IPFS block.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| block | `Uint8Array` | The block of data to store |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| format | `String` | `'dag-pb'` | The codec to use to create the CID |
| mhtype | `String` | `sha2-256` | The hashing algorithm to use to create the CID |
| mhlen | `Number` | `undefined` | The hash length (only relevant for `go-ipfs`) |
| version | `Number` | `0` |  The version to use to create the CID |
| pin | `boolean` | `false` |  If true, pin added blocks recursively |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |
| preload | `boolean` | `false` |  Whether to preload all blocks created during this operation |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID][CID] type object containing the hash of the block |

### Example

```JavaScript
// Defaults
const buf = new TextEncoder().encode('a serialized object')
const decoder = new TextDecoder()

const block = await ipfs.block.put(buf)

console.log(decoder.decode(block.data))
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
| quiet | `boolean` | `false` | Write minimal output |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects containing hash and (potentially) error strings |

Each object yielded is of the form:

```js
{
  cid: CID,
  error?: Error
}
```

Note: If an error is present for a given object, the block with that cid was not removed and the `error` will contain the reason why, for example if the block was pinned.

### Example

```JavaScript
for await (const result of ipfs.block.rm(cid)) {
  if (result.error) {
    console.error(`Failed to remove block ${result.cid} due to ${result.error.message}`)
  } else {
    console.log(`Removed block ${result.cid}`)
  }
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
| preload | `boolean` | `false` |  Whether to preload all blocks created during this operation |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the block's info |

the returned object has the following keys:

```JavaScript
{
  cid: CID
  size: number
}
```

### Example

```JavaScript
const multihashStr = 'QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ'
const cid = CID.parse(multihashStr)

const stats = await ipfs.block.stat(cid)
console.log(stats.cid.toString())
// Logs: QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ
console.log(stat.size)
// Logs: 3739
```

A great source of [examples][] can be found in the tests for this API.

[block]: https://github.com/ipfs/js-ipfs-block
[multihash]: https://github.com/multiformats/multihash
[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/block
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[cid]: https://docs.ipfs.io/concepts/content-addressing

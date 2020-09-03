# Repo API <!-- omit in toc -->

- [`ipfs.repo.gc([options])`](#ipfsrepogcoptions)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.repo.stat([options])`](#ipfsrepostatoptions)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
  - [Notes](#notes)
- [`ipfs.repo.version([options])`](#ipfsrepoversionoptions)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)

## `ipfs.repo.gc([options])`

> Perform a garbage collection sweep on the repo.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| quiet | `boolean` | `false` | Write minimal output |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects describing nodes that were garbage collected |

Each yielded object contains the following properties:

- `err` is an `Error` if it was not possible to GC a particular block.
- `cid` is the [CID][cid] of the block that was Garbage Collected.

### Example

```JavaScript
for await (const res of ipfs.repo.gc()) {
  console.log(res)
}
```

## `ipfs.repo.stat([options])`

> Get stats for the currently used repo.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| human | `boolean` | `false` | Return storage numbers in `MiB` |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the repo's info |

the returned object has the following keys:

- `numObjects` is a [BigNumber Int][1].
- `repoSize` is a [BigNumber Int][1], in bytes.
- `repoPath` is a string.
- `version` is a string.
- `storageMax` is a [BigNumber Int][1].

### Example

```JavaScript
const stats = await ipfs.repo.stat()
console.log(stats)

// { numObjects: 15,
//   repoSize: 64190,
//   repoPath: 'C:\\Users\\henri\\AppData\\Local\\Temp\\ipfs_687c6eb3da07d3b16fe3c63ce17560e9',
//   version: 'fs-repo@6',
//   storageMax: 10000000000 }
```

### Notes

`stats.repo` and `repo.stat` can be used interchangeably.

## `ipfs.repo.version([options])`

> Show the repo version.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<String>` | A String containing the repo's version |

### Example

```JavaScript
const version = await ipfs.repo.version()
console.log(version)

// "6"
```

[1]: https://github.com/MikeMcl/bignumber.js/
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

# DAG API <!-- omit in toc -->

> The dag API comes to replace the `object API`, it supports the creation and manipulation of dag-pb object, as well as other IPLD formats (i.e dag-cbor, ethereum-block, git, etc)

- [`ipfs.dag.export(cid, [options])`](#ipfsdagexportcid-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.dag.put(dagNode, [options])`](#ipfsdagputdagnode-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.dag.get(cid, [options])`](#ipfsdaggetcid-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.dag.import(source, [options])`](#ipfsdagimportsource-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.dag.resolve(ipfsPath, [options])`](#ipfsdagresolveipfspath-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)

_Explore the DAG API through interactive coding challenges in our ProtoSchool tutorials:_
- _[P2P data links with content addressing](https://proto.school/#/basics/) (beginner)_
- _[Blogging on the Decentralized Web](https://proto.school/#/blog/) (intermediate)_

## `ipfs.dag.export(cid, [options])`

> Returns a stream of Uint8Arrays that make up a [CAR file][]

Exports a CAR for the entire DAG available from the given root CID. The CAR will have a single
root and IPFS will attempt to fetch and bundle all blocks that are linked within the connected
DAG.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid  | [CID][] | The root CID of the DAG we wish to export |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Uint8Array>` | A stream containing the car file bytes |

### Example

```JavaScript
import { Readable } from 'stream'

const out = await ipfs.dag.export(cid)

Readable.from(out).pipe(fs.createWriteStream('example.car'))
```

A great source of [examples][] can be found in the tests for this API.
## `ipfs.dag.put(dagNode, [options])`

> Store an IPLD format node

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| dagNode | `Object` | A DAG node that follows one of the supported IPLD formats |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| storeCodec | `String` | `'dag-cbor'` | The codec that the stored object will be encoded with |
| inputCodec | `String` | `undefined` | If an already encoded object is provided (as a `Uint8Array`), the codec that the object is encoded with, otherwise it is assumed the `dagNode` argument is an object to be encoded |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to be used over the serialized DAG node |
| cid | [CID][] | `'dag-cbor'` | The IPLD format multicodec |
| pin | `boolean` | `false` | Pin this node when adding to the blockstore |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

**Note**: You should pass `cid` or the `format` & `hashAlg` pair but _not both_.

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID][] instance. The CID generated through the process or the one that was passed |

### Example

```JavaScript
const obj = { simple: 'object' }
const cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-512' })

console.log(cid.toString())
// zBwWX9ecx5F4X54WAjmFLErnBT6ByfNxStr5ovowTL7AhaUR98RWvXPS1V3HqV1qs3r5Ec5ocv7eCdbqYQREXNUfYNuKG
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dag.get(cid, [options])`

> Retrieve an IPLD format node

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | A CID that resolves to a node to get |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| path | `String` | An optional path within the DAG to resolve |
| localResolve | `boolean` | `false` | If set to true, it will avoid resolving through different objects |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object representing an IPLD format node |

The returned object contains:

- `value` - the value or node that was fetched during the get operation.
- `remainderPath` - The remainder of the Path that the node was unable to resolve or what was left in a localResolve scenario.

### Example

```JavaScript
// example obj
const obj = {
  a: 1,
  b: [1, 2, 3],
  c: {
    ca: [5, 6, 7],
    cb: 'foo'
  }
}

const cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
console.log(cid.toString())
// zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5

async function getAndLog(cid, path) {
  const result = await ipfs.dag.get(cid, { path })
  console.log(result.value)
}

await getAndLog(cid, '/a')
// Logs:
// 1

await getAndLog(cid, '/b')
// Logs:
// [1, 2, 3]

await getAndLog(cid, '/c')
// Logs:
// {
//   ca: [5, 6, 7],
//   cb: 'foo'
// }

await getAndLog(cid, '/c/ca/1')
// Logs:
// 6
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dag.import(source, [options])`

> Adds one or more [CAR file][]s full of blocks to the repo for this node

Import all blocks from one or more CARs and optionally recursively pin the roots identified
within the CARs.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| sources | `AsyncIterable<Uint8Array>` | One or more [CAR file][] streams |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| pinRoots | `boolean` | `true` | Whether to recursively pin each root to the blockstore |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<{ root: { cid: CID, pinErrorMsg?: string } }>` | A stream containing all roots from the car file(s) that are pinned |

### Example

```JavaScript
import fs from 'fs'

for await (const result of ipfs.dag.import(fs.createReadStream('./path/to/archive.car'))) {
  console.info(result)
  // Qmfoo
}
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dag.resolve(ipfsPath, [options])`

> Returns the CID and remaining path of the node at the end of the passed IPFS path

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ipfsPath | `String` or [CID][] | An IPFS path, e.g. `/ipfs/bafy/dir/file.txt` or a [CID][] instance |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| path | `String` | `undefined` | If `ipfsPath` is a [CID][], you may pass a path here |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<{ cid: CID, remainderPath: String }>` | The last CID encountered during the traversal and the path to the end of the IPFS path inside the node referenced by the CID |

### Example

```JavaScript
// example obj
const obj = {
  a: 1,
  b: [1, 2, 3],
  c: {
    ca: [5, 6, 7],
    cb: 'foo'
  }
}

const cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
console.log(cid.toString())
// bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq

const result = await ipfs.dag.resolve(`${cid}/c/cb`)
console.log(result)
// Logs:
// {
//   cid: CID(bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq),
//   remainderPath: 'c/cb'
// }
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/dag
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[CAR file]: https://ipld.io/specs/transport/car/

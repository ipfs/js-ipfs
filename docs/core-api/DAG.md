# DAG API <!-- omit in toc -->

> The dag API comes to replace the `object API`, it supports the creation and manipulation of dag-pb object, as well as other IPLD formats (i.e dag-cbor, ethereum-block, git, etc)

- [`ipfs.dag.put(dagNode, [options])`](#ipfsdagputdagnode-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.dag.get(cid, [path], [options])`](#ipfsdaggetcid-path-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.dag.tree(cid, [path,] [options])`](#ipfsdagtreecid-path-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)

_Explore the DAG API through interactive coding challenges in our ProtoSchool tutorials:_
- _[P2P data links with content addressing](https://proto.school/#/basics/) (beginner)_
- _[Blogging on the Decentralized Web](https://proto.school/#/blog/) (intermediate)_

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
| format | `String` | `'dag-cbor'` | The IPLD format multicodec |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to be used over the serialized DAG node |
| cid | [CID][] | `'dag-cbor'` | The IPLD format multicodec |
| pin | `boolean` | `false` | Pin this node when adding to the blockstore |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

**Note**: You should pass `cid` or the `format` & `hashAlg` pair but _not both_.

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID][] instance. The CID generated through the process or the one that was passed |

### Example

```JavaScript
const obj = { simple: 'object' }
const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' })

console.log(cid.toString())
// zBwWX9ecx5F4X54WAjmFLErnBT6ByfNxStr5ovowTL7AhaUR98RWvXPS1V3HqV1qs3r5Ec5ocv7eCdbqYQREXNUfYNuKG
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dag.get(cid, [path], [options])`

> Retrieve an IPLD format node

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | A DAG node that follows one of the supported IPLD formats |
| path | `String` | An optional path within the DAG to resolve |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
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

const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
console.log(cid.toString())
// zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5

async function getAndLog(cidPath) {
  const result = await ipfs.dag.get(cidPath)
  console.log(result.value)
}

await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/a')
// Logs:
// 1

await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/b')
// Logs:
// [1, 2, 3]

await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/c')
// Logs:
// {
//   ca: [5, 6, 7],
//   cb: 'foo'
// }

await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/c/ca/1')
// Logs:
// 6
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.dag.tree(cid, [path,] [options])`

> Enumerate all the entries in a graph

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | A DAG node that follows one of the supported IPLD formats |
| path | `String` | An optional path within the DAG to resolve |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `false` | If set to true, it will follow the links and continuously run tree on them, returning all the paths in the graph |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array with the paths passed |

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

const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
console.log(cid.toString())
// zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5

const result = await ipfs.dag.tree('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5')
console.log(result)
// Logs:
// a
// b
// b/0
// b/1
// b/2
// c
// c/ca
// c/ca/0
// c/ca/1
// c/ca/2
// c/cb
```

A great source of [examples][] can be found in the tests for this API.


[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/dag
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

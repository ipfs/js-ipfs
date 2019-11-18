# DAG API

> The dag API comes to replace the `object API`, it supports the creation and manipulation of dag-pb object, as well as other IPLD formats (i.e dag-cbor, ethereum-block, git, etc)

* [dag.put](#dagput)
* [dag.get](#dagget)
* [dag.tree](#dagtree)

_Explore the DAG API through interactive coding challenges in our ProtoSchool tutorials:_
- _[P2P data links with content addressing](https://proto.school/#/basics/) (beginner)_
- _[Blogging on the Decentralized Web](https://proto.school/#/blog/) (intermediate)_

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `dag.put`

> Store an IPLD format node

##### `ipfs.dag.put(dagNode, [options])`

- `dagNode` - a DAG node that follows one of the supported IPLD formats.
- `options` - a object that might contain the following values:
    - `format` - The IPLD format multicodec (default `dag-cbor`).
    - `hashAlg` - The hash algorithm to be used over the serialized DAG node (default `sha2-256`).
    - `cid` - The CID of the node passed. **Note**: You should pass the CID or the `format` + `hashAlg` pair but _not both_.
    - `pin` - Pin this node when adding (default `false`)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | A [CID](https://github.com/ipfs/js-cid) instance. The CID generated through the process or the one that was passed |

**Example:**

```JavaScript
const obj = { simple: 'object' }
const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' })

console.log(cid.toString())
// zBwWX9ecx5F4X54WAjmFLErnBT6ByfNxStr5ovowTL7AhaUR98RWvXPS1V3HqV1qs3r5Ec5ocv7eCdbqYQREXNUfYNuKG
```

A great source of [examples][] can be found in the tests for this API.

#### `dag.get`

> Retrieve an IPLD format node

##### `ipfs.dag.get(cid, [path], [options])`

- `cid` - can be one of the following:
  - a [CID](https://github.com/ipfs/js-cid) instance.
  - a CID in its String format (i.e: zdpuAkxd9KzGwJFGhymCZRkPCXtBmBW7mB2tTuEH11HLbES9Y)
  - a CID in its String format concatenated with the path to be resolved
- `path` - the path to be resolved. Optional.
- `options` - a object that might contain the following values:
  - `localResolve` - bool - if set to true, it will avoid resolving through different objects.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object representing an IPLD format node |

the returned object contains:

- `value` - the value or node that was fetched during the get operation.
- `remainderPath` - The remainder of the Path that the node was unable to resolve or what was left in a localResolve scenario.

**Example:**

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

#### `dag.tree`

> Enumerate all the entries in a graph

##### `ipfs.dag.tree(cid, [path], [options])`

- `cid` - can be one of the following:
  - a [CID](https://github.com/ipfs/js-cid) instance.
  - a CID in its String format (i.e: zdpuAkxd9KzGwJFGhymCZRkPCXtBmBW7mB2tTuEH11HLbES9Y)
  - a CID in its String format concatenated with the path to be resolved
- `path` - the path to be resolved. Optional.
- `options` - a object that might contain the following values:
  - `recursive` - bool - if set to true, it will follow the links and continuously run tree on them, returning all the paths in the graph.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array with the paths passed |

**Example:**

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


[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/dag

dag API
=======

> The dag API comes to replace the `object API`, it support the creation and manipulation of dag-pb object, as well as other IPLD formats (i.e dag-cbor, ethereum-block, git, etc)

#### `dag.put`

> Store an IPLD format node

##### `Go` **WIP**

##### `JavaScript` - ipfs.dag.put(dagNode, options, callback)

- `dagNode` - a DAG node that follows one of the supported IPLD formats.
- `options` - a object that might contain the follwing values:
    - `format` - The IPLD format multicodec.
    - `hashAlg` - The hash algorithm to be used over the serialized dagNode.
  - or
    - `cid` - the CID of the node passed.
  - **Note** - You should only pass the CID or the format + hashAlg pair and not both
- `callback` must follow `function (err, cid) {}` signature, where `err` is an error if the operation was not successful and CID is the CID generated through the process or the one that was passed

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
const obj = { simple: 'object' }

ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
  console.log(cid.toBaseEncodedString())
  // zdpuAzE1oAAMpsfdoexcJv6PmL9UhE8nddUYGU32R98tzV5fv
})
```

A great source of [examples][] can be found in the tests for this API.

#### `dag.get`

> Retrieve an IPLD format node

##### `Go` **WIP**

##### `JavaScript` - ipfs.dag.get(cid [, path, options], callback)

- `cid` - can be one of the following:
  - a [CID](https://github.com/ipfs/js-cid) instance.
  - a CID in its String format (i.e: zdpuAkxd9KzGwJFGhymCZRkPCXtBmBW7mB2tTuEH11HLbES9Y)
  - a CID in its String format concatenated with the path to be resolved
- `path` - the path to be resolved. Optional.
- `options` - a object that might contain the following values:
  - `localResolve` - bool - if set to true, it will avoid resolving through different objects.

`callback` must follow `function (err, result) {}` signature, where `err` is an error if the operation was not successful and `result` is an object containing:

- `value` - the value or node that was fetched during the get operation.
- `remainderPath` - The remainder of the Path that the node was unable to resolve or what was left in a localResolve scenario.

If no `callback` is passed, a [promise][] is returned.

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

ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
  console.log(cid.toBaseEncodedString())
  // zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5
})

function errOrLog(err, result) {
  if (err) {
    console.error('error: ' + err)
  } else {
    console.log(result.value)
  }
}

ipfs.dag.get('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/a', errOrLog)
// Logs:
// 1

ipfs.dag.get('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/b', errOrLog)
// Logs:
// [1, 2, 3]

ipfs.dag.get('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/c', errOrLog)
// Logs:
// {
//   ca: [5, 6, 7],
//   cb: 'foo'
// }

ipfs.dag.get('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/c/ca/1', errOrLog)
// Logs:
// 6
```

A great source of [examples][] can be found in the tests for this API.

#### `dag.tree`

> Enumerate all the entries in a graph

##### `Go` **WIP**

##### `JavaScript` - ipfs.dag.tree(cid [, path, options], callback)

- `cid` - can be one of the following:
  - a [CID](https://github.com/ipfs/js-cid) instance.
  - a CID in its String format (i.e: zdpuAkxd9KzGwJFGhymCZRkPCXtBmBW7mB2tTuEH11HLbES9Y)
  - a CID in its String format concatenated with the path to be resolved
- `path` - the path to be resolved. Optional.
- `options` - a object that might contain the following values:
  - `recursive` - bool - if set to true, it will follow the links and continuously run tree on them, returning all the paths in the graph.

`callback` must follow `function (err, result) {}` signature, where `err` is an error if the operation was not successful and `result` is an Array with the paths passed.

If no `callback` is passed, a [promise][] is returned.

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

ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
  console.log(cid.toBaseEncodedString())
  // zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5
})

function errOrLog(err, result) {
  if (err) {
    console.error('error: ' + err)
  } else {
    console.log(result)
  }
}

ipfs.dag.tree('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5', errOrLog)
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


[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/dag.js

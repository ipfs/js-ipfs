dag API
=======

#### `dag.put`

> Store an IPLD format node

##### `Go` **WIP**

##### `JavaScript` - ipfs.dag.put(dagNode, formatMulticodec, hashAlg, callback)

`dagNode` - a DAG node that follows one of the supported IPLD formats.

`formatMulticodec` - The IPLD format multicodec.

`hashAlg` - The hash algorithm to be used over the serialized dagNode.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a [promise][] is returned.

#### `dag.get`

> Retrieve an IPLD format node

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.get(cid, callback)

`cid` is a [CID][https://github.com/ipfs/js-cid] instance.

`callback` must follow `function (err, dagNode) {}` signature, where `err` is an error if the operation was not successful and `dagNode` is the IPLD format DAG node retrieved.

If no `callback` is passed, a [promise][] is returned.

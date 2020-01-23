# Refs API

* [refs](#refs)
* [refs.local](#refslocal)

#### `refs`

> Get links (references) from an object.

##### `ipfs.refs(ipfsPath, [options])`

`ipfsPath` can be of type:

- [`cid`][cid] of type:
  - a [CID](https://github.com/ipfs/js-cid) instance
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`options` is an optional object that may contain the following keys:
  - `recursive (false)`: recursively list references of child nodes
  - `unique (false)`: omit duplicate references from output
  - `format ("<dst>")`: output edges with given format. Available tokens: `<src>`, `<dst>`, `<linkname>`
  - `edges (false)`: output references in edge format: `"<src> -> <dst>"`
  - `maxDepth (1)`: only for recursive refs, limits fetch and listing to the given depth
  - `timeout (number|string)`: Throw an error if the request does not complete within the specified milliseconds timeout. If `timeout` is a string, the value is parsed as a [human readable duration](https://www.npmjs.com/package/parse-duration). There is no timeout by default.

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the links (references) |

Each yielded object is of the form:

```js
{
  ref: string,
  err: Error | null
}
```

**Example:**

```JavaScript
for await (const ref of ipfs.refs(ipfsPath, { recursive: true })) {
  if (ref.err) {
    console.error(ref.err)
  } else {
    console.log(ref.ref)
    // output: "QmHash"
  }
}
```

#### `refs.local`

> Output all local references (CIDs of all blocks in the blockstore)

##### `ipfs.refs.local()`

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the links (references) |

Each yielded object is of the form:

```js
{
  ref: string,
  err: Error | null
}
```

**Example:**

```JavaScript
for await (const ref of ipfs.refs.local()) {
  if (ref.err) {
    console.error(ref.err)
  } else {
    console.log(ref.ref)
    // output: "QmHash"
  }
}
```

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/files-regular
[b]: https://www.npmjs.com/package/buffer
[cid]: https://www.npmjs.com/package/cids
[blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob

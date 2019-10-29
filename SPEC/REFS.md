# Refs API

* [refs](#refs)
* [refsReadableStream](#refsreadablestream)
* [refsPullStream](#refspullstream)
* [refs.local](#refslocal)
* [refs.localReadableStream](#refslocalreadablestream)
* [refs.localPullStream](#refslocalpullstream)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

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

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array representing the links (references) |

example of the returned array:
```js
{
  ref: "myref",
  err: "error msg"
}
```

**Example:**

```JavaScript
const refs = await ipfs.refs(ipfsPath, { recursive: true })

for (const ref of refs) {
  if (ref.err) {
    console.error(ref.err)
  } else {
    console.log(ref.ref)
    // output: "QmHash"
  }
}
```

#### `refsReadableStream`

> Output references using a [Readable Stream][rs]

##### `ipfs.refsReadableStream(ipfsPath, [options])`

`options` is an optional object argument identical to the options for [ipfs.refs](#refs)

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] representing the references |

**Example:**

```JavaScript
const stream = ipfs.refsReadableStream(ipfsPath, { recursive: true })
stream.on('data', function (ref) {
  // 'ref' will be of the form
  // {
  //   ref: 'QmHash',
  //   err: 'err message'
  // }
})
```

#### `refsPullStream`

> Output references using a [Pull Stream][ps].

##### `ipfs.refsReadableStream(ipfsPath, [options])`

`options` is an optional object argument identical to the options for [ipfs.refs](#refs)

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [Pull Stream][ps] representing the references |

**Example:**

```JavaScript
const stream = ipfs.refsPullStream(ipfsPath, { recursive: true })

pull(
  stream,
  pull.collect((err, values) => {
    // values will be an array of objects, each one of the form
    // {
    //   ref: 'QmHash',
    //   err: 'err message'
    // }
  })
)
```

#### `refs.local`

> Output all local references (CIDs of all blocks in the blockstore)

##### `ipfs.refs.local()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array representing all the local references |

example of the returned array:
```js
{
  ref: "myref",
  err: "error msg"
}
```

**Example:**

```JavaScript
ipfs.refs.local(function (err, refs) {
  if (err) {
    throw err
  }

  for (const ref of refs) {
    if (ref.err) {
      console.error(ref.err)
    } else {
      console.log(ref.ref)
      // output: "QmHash"
    }
  }
})
```

#### `refs.localReadableStream`

> Output all local references using a [Readable Stream][rs]

##### `ipfs.localReadableStream()`

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] representing all the local references |

**Example:**

```JavaScript
const stream = ipfs.refs.localReadableStream()
stream.on('data', function (ref) {
  // 'ref' will be of the form
  // {
  //   ref: 'QmHash',
  //   err: 'err message'
  // }
})
```

#### `refs.localPullStream`

> Output all local references using a [Pull Stream][ps].

##### `ipfs.refs.localReadableStream()`

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [Pull Stream][ps] representing all the local references |

**Example:**

```JavaScript
const stream = ipfs.refs.localPullStream()

pull(
  stream,
  pull.collect((err, values) => {
    // values will be an array of objects, each one of the form
    // {
    //   ref: 'QmHash',
    //   err: 'err message'
    // }
  })
)
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/files-regular
[b]: https://www.npmjs.com/package/buffer
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream
[cid]: https://www.npmjs.com/package/cids
[blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob

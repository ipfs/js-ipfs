files API
=========

> The files API enables users to use the File System abstraction of IPFS.

#### `add`

> Add files and data to IPFS.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.add(data, [options], [callback])

Where `data` may be:

- a [`Buffer instance`][b]
- a [`Readable Stream`][rs]
- a [`Pull Stream`][ps]
- a Path (caveat: will only work in Node.js)
- a URL
- an array of objects, each of the form:
```JavaScript
{
  path: '/tmp/myfile.txt', // The file path
  content: <data> // A Buffer, Readable Stream or Pull Stream with the contents of the file
}
```
If no `content` is passed, then the path is treated as an empty directory

`options` is an optional object argument that might include the following keys:

- cid-version (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including it's version)
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- recursive (boolean): for when a Path is passed, this option can be enabled to add recursively all the files.
- hashAlg || hash (string): multihash hashing algorithm to use

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

```JavaScript
{
  path: '/tmp/myfile.txt',
  hash: 'QmHash', // base58 encoded multihash
  size: 123
}
```

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const files = [
  {
    path: '/tmp/myfile.txt',
    content: (Buffer or Readable stream)
  }
]

ipfs.files.add(files, function (err, files) {
  // 'files' will be an array of objects containing paths and the multihashes of the files added
})
```

A great source of [examples][] can be found in the tests for this API.

#### `addReadableStream`

> Add files and data to IPFS using a [Readable Stream][rs] of class Duplex.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.addReadableStream([options]) -> [Readable Stream][rs]

Returns a Readable Stream of class Duplex, where objects can be written of the forms

```js
{
  path: '/tmp/myfile.txt', // The file path
  content: <data> // A Buffer, Readable Stream or Pull Stream with the contents of the file
}
```

`options` is an optional object argument that might include the following keys:

- cid-version (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including it's version)
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- hashAlg || hash (string): multihash hashing algorithm to use

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const stream = ipfs.files.addReadableStream()
stream.on('data', function (file) {
  // 'file' will be of the form
  // {
  //   path: '/tmp/myfile.txt',
  //   hash: 'QmHash' // base58 encoded multihash
  //   size: 123
  // }
})

stream.write({
  path: <path>
  content: <data>
})
// write as many files as you want

stream.end()
})
```

A great source of [examples][] can be found in the tests for this API.

#### `addPullStream`

> Add files and data to IPFS using a [Pull Stream][ps].

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.addPullStream([options]) -> [Pull Stream][ps]

Returns a Pull Stream, where objects can be written of the forms

```js
{
  path: '/tmp/myfile.txt', // The file path
  content: <data> // A Buffer, Readable Stream or Pull Stream with the contents of the file
}
```

`options` is an optional object argument that might include the following keys:

- cid-version (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including it's version)
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- hashAlg || hash (string): multihash hashing algorithm to use

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const stream = ipfs.files.addPullStream()

pull(
  pull.values([
    { path: <path>, content: <data> }
  ]),
  stream,
  pull.collect((err, values) => {
    // values will be an array of objects, which one of the form
    // {
    //   path: '/tmp/myfile.txt',
    //   hash: 'QmHash' // base58 encoded multihash
    //   size: 123
    // }
  })
)
```

#### `cat`

> Returns a file addressed by a valid IPFS Path.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.cat(ipfsPath, [callback])

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`callback` must follow `function (err, file) {}` signature, where `err` is an error if the operation was not successful and `file` is a [Buffer][b]

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.cat(ipfsPath, function (err, file) {
  if (err) {
    throw err
  }

  console.log(file.toString('utf8'))
})
```

A great source of [examples][] can be found in the tests for this API.

#### `catReadableStream`

> Returns a [Readable Stream][rs] containing the contents of a file addressed by a valid IPFS Path.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.catReadableStream(ipfsPath) -> [Readable Stream][rs]

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

Returns a [Readable Stream][rs] with the contents of the file.


```JavaScript
const stream = ipfs.files.catReadableStream(ipfsPath)
// stream will be a stream containing the data of the file requested
```

A great source of [examples][] can be found in the tests for this API.

#### `catPullStream`

> Returns a [Pull Stream][ps] containing the contents of a file addressed by a valid IPFS Path.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.catPullStream(ipfsPath) -> [Pull Stream][rs]

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

Returns a [Pull Stream][ps] with the contents of the file.

```JavaScript
const stream = ipfs.files.catPullStream(ipfsPath)
// stream will be a stream containing the data of the file requested
})
```

A great source of [examples][] can be found in the tests for this API.

#### `get`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.get(ipfsPath, [callback])

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`callback` must follow `function (err, files) {}` signature, where `err` is an error if the operation was not successful. `files` is an array containing objects of the following form:

```js
{
  path: '/tmp/myfile.txt',
  content: <data as a Buffer>
}
```

Here, each `path` corresponds to the name of a file, and `content` is a regular Readable stream with the raw contents of that file.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const validCID = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

ipfs.files.get(validCID, function (err, files) {
  files.forEach((file) => {
    console.log(file.path)
    console.log(file.content.toString('utf8'))
  })
})
```

A great source of [examples][] can be found in the tests for this API.

#### `getReadableStream`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path. The files will be yielded as Readable Streams.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.getReadableStream(ipfsPath) -> [Readable Stream][rs]

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

It returns a [Readable Stream][rs] in [Object mode](https://nodejs.org/api/stream.html#stream_object_mode) that will yield objects of the form:

```js
{
  path: '/tmp/myfile.txt',
  content: <Readable stream>
}
```

**Example:**

```JavaScript
const validCID = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

const stream = ipfs.files.getReadableStream(validCID)

stream.on('data', (file) => {
  // write the file's path and contents to standard out
  console.log(file.path)
  console.log(file.path.toString())
})
```

A great source of [examples][] can be found in the tests for this API.

#### `getPullStream`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path. The files will be yielded as Readable Streams.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.getPullStream(ipfsPath) -> [Pull Stream][ps]

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

It returns a [Pull Stream][os] that will yield objects of the form:

```js
{
  path: '/tmp/myfile.txt',
  content: <Pull Stream>
}
```

**Example:**

```JavaScript
const validCID = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

const stream = ipfs.files.getReadableStream(validCID)

pull(
  stream,
  pull.collect((err, files) => {
    if (err) {
      throw err
    }

    files.forEach((file) => {
      console.log(file.path)
      console.log(file.path.toString())
    })
  })
)
```

A great source of [examples][] can be found in the tests for this API.

#### `ls`

> Lists a directory from IPFS that is addressed by a valid IPFS Path.

##### `Go` **WIP**

##### `JavaScript` - ipfs.ls(ipfsPath, [callback])

> **Note:** ipfs.files.ls is currently only for MFS directories. The goal is to converge both functionality.

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`callback` must follow `function (err, files) {}` signature, where `err` is an error if the operation was not successful. `files` is an array containing objects of the following form:

```js
{
  depth: 1,
  name: 'alice.txt',
  path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
  size: 11696,
  hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
  type: 'file'
}
```

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const validCID = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

ipfs.files.ls(validCID, function (err, files) {
  files.forEach((file) => {
    console.log(file.path)
  })
})
```

A great source of [examples][] can be found in the tests for this API.

#### `lsReadableStream`

> Lists a directory from IPFS that is addressed by a valid IPFS Path. The list will be yielded as Readable Streams.

##### `Go` **WIP**

##### `JavaScript` - ipfs.lsReadableStream(ipfsPath) -> [Readable Stream][rs]

> **Note:** ipfs.files.ls is currently only for MFS directories. The goal is to converge both functionality.

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

It returns a [Readable Stream][rs] in [Object mode](https://nodejs.org/api/stream.html#stream_object_mode) that will yield objects of the form:

```js
{
  depth: 1,
  name: 'alice.txt',
  path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
  size: 11696,
  hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
  type: 'file'
}
```

**Example:**

```JavaScript
const validCID = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

const stream = ipfs.files.lsReadableStream(validCID)

stream.on('data', (file) => {
  // write the file's path and contents to standard out
  console.log(file.path)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `lsPullStream`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path. The files will be yielded through a Pull Stream.

##### `Go` **WIP**

##### `JavaScript` - ipfs.lsPullStream(ipfsPath) -> [Pull Stream][ps]

> **Note:** ipfs.files.ls is currently only for MFS directories. The goal is to converge both functionality.


ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

It returns a [Pull Stream][os] that will yield objects of the form:

```js
{
  depth: 1,
  name: 'alice.txt',
  path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
  size: 11696,
  hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
  type: 'file'
}
```

**Example:**

```JavaScript
const validCID = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

const stream = ipfs.files.getReadableStream(validCID)

pull(
  stream,
  pull.collect((err, files) => {
    if (err) {
      throw err
    }

    files.forEach((file) => console.log(file.path))
  })
)
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/files.js
[b]: https://www.npmjs.com/package/buffer
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream
[cid]: https://www.npmjs.com/package/cids

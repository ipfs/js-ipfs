# Files API

> The files API enables users to use the File System abstraction of IPFS. There are two Files API, one at the top level, the original `add`, `cat`, `get` and `ls`, and another behind the [`files`, also known as MFS](https://github.com/ipfs/specs/issues/98). [We are currently going through a revamping process of this APIs to make them more user friendly](https://github.com/ipfs/interface-ipfs-core/issues/284).

- The Regular (top level) API for add, cat, get and ls Files on IPFS
  - [add](#add)
  - [addReadableStream](#addreadablestream)
  - [addPullStream](#addpullstream)
  - [addFromFs](#addfromfs)
  - [addFromURL](#addfromurl)
  - [addFromStream](#addfromstream)
  - [cat](#cat)
  - [catReadableStream](#catreadablestream)
  - [catPullStream](#catpullstream)
  - [get](#get)
  - [getReadableStream](#getreadablestream)
  - [getPullStream](#getpullstream)
  - [ls](#ls)
  - [lsReadableStream](#lsreadablestream)
  - [lsPullStream](#lspullstream)
- The Files API, aka MFS (Mutable File System)
  - [files.cp](#filescp)
  - [files.flush](#filesflush)
  - [files.ls](#filesls)
  - [files.lsReadableStream](#fileslsreadablestream)
  - [files.lsPullStream](#fileslspullstream)
  - [files.mkdir](#filesmkdir)
  - [files.mv](#filesmv)
  - [files.read](#filesread)
  - [files.readPullStream](#filesreadpullstream)
  - [files.readReadableStream](#filesreadreadablestream)
  - [files.rm](#filesrm)
  - [files.stat](#filesstat)
  - [files.write](#fileswrite)

#### `add`

> Add files and data to IPFS.

##### `ipfs.add(data, [options], [callback])`

Where `data` may be:

- a [`Buffer instance`][b]
- a [`Readable Stream`][rs]
- a [`Pull Stream`][ps]
- a [`File`][file]
- an array of objects, each of the form:
```JavaScript
{
  path: '/tmp/myfile.txt', // The file path
  content: <data> // A Buffer, Readable Stream, Pull Stream or File with the contents of the file
}
```
If no `content` is passed, then the path is treated as an empty directory

`options` is an optional object argument that might include the following keys:

- cid-version (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including it's version)
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- recursive (boolean): for when a Path is passed, this option can be enabled to add recursively all the files.
- hashAlg || hash (string): multihash hashing algorithm to use. (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
- wrapWithDirectory (boolean): adds a wrapping node around the content.
- onlyHash (boolean): doesn't actually add the file to IPFS, but rather calculates its hash.
- pin (boolean, default true): pin this object when adding.
- raw-leaves (boolean, default false): if true, DAG leaves will contain raw file data and not be wrapped in a protobuf
- chunker (string, default size-262144): chunking algorithm used to build ipfs DAGs. Available formats:
  - size-{size}
  - rabin
  - rabin-{avg}
  - rabin-{min}-{avg}-{max}

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

In the browser, assuming `ipfs = new Ipfs(...)`:

```js
const content = Ipfs.Buffer.from('ABC')
const results = await ipfs.add(content)
const hash = results[0].hash // "Qm...WW"
```

Now [ipfs.io/ipfs/Qm...WW](https://ipfs.io/ipfs/QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW)
returns the "ABC" string.

The following allows you to add multiple files at once. Note that intermediate directories in file paths will be automatically created and returned in the response along with files:

```JavaScript
const files = [
  {
    path: '/tmp/myfile.txt',
    content:  Ipfs.Buffer.from('ABC')
  }
]

const results = await ipfs.add(files)
```

The `results` array:

```json
[
  {
    "path": "tmp",
    "hash": "QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg",
    "size": 67
  },
  {
    "path": "/tmp/myfile.txt",
    "hash": "QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW",
    "size": 11
  }
]
```

A great source of [examples][] can be found in the tests for this API.

#### `addReadableStream`

> Add files and data to IPFS using a [Readable Stream][rs] of class Duplex.

##### `ipfs.addReadableStream([options])` -> [Readable Stream][rs]

Returns a Readable Stream of class Duplex, where objects can be written of the forms

```js
{
  path: '/tmp/myfile.txt', // The file path
  content: <data> // A Buffer, Readable Stream, Pull Stream or File with the contents of the file
}
```

`options` is an optional object argument that might include the following keys:

- cid-version (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including it's version)
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- hashAlg || hash (string): multihash hashing algorithm to use. (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
- wrapWithDirectory (boolean): adds a wrapping node around the content
- pin (boolean, default true): pin this object when adding.

**Example:**

```JavaScript
const stream = ipfs.addReadableStream()
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

##### `ipfs.addPullStream([options])` -> [Pull Stream][ps]

Returns a Pull Stream, where objects can be written of the forms

```js
{
  path: '/tmp/myfile.txt', // The file path
  content: <data> // A Buffer, Readable Stream, Pull Stream or File with the contents of the file
}
```

`options` is an optional object argument that might include the following keys:

- cid-version (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including it's version)
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- hashAlg || hash (string): multihash hashing algorithm to use. (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
- wrapWithDirectory (boolean): adds a wrapping node around the content
- pin (boolean, default true): pin this object when adding.

**Example:**

```JavaScript
const stream = ipfs.addPullStream()

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

#### `addFromFs`

> Add files or entire directories from the FileSystem to IPFS

##### `ipfs.addFromFs(path, [options], [callback])`

Reads a file or folder from `path` on the filesystem  and adds it to IPFS.

Options:
  - **recursive**: If `path` is a directory, use option `{ recursive: true }` to add the directory and all its sub-directories.
  - **ignore**: To exclude file globs from the directory, use option `{ ignore: ['ignore/this/folder/**', 'and/this/file'] }`.
  - **hidden**: hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`.

```JavaScript
ipfs.addFromFs('path/to/a/folder', { recursive: true , ignore: ['subfolder/to/ignore/**']}, (err, result) => {
  if (err) { throw err }
  console.log(result)
})
```

`result` is an array of objects describing the files that were added, such as:

```js
[
  {
    path: 'test-folder',
    hash: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6',
    size: 2278
  },
  // ...
]
```

#### `addFromURL`

> Add a file from a URL to IPFS

##### `ipfs.addFromURL(url, [callback])`

```JavaScript
ipfs.addFromURL('http://example.com/', (err, result) => {
  if (err) {
    throw err
  }
  console.log(result)
})
```

#### `addFromStream`

> Add a file from a stream to IPFS

##### `ipfs.addFromStream(stream, [callback])`

This is very similar to `ipfs.add({ path:'', content: stream })`. It is like the reverse of cat.

```JavaScript
ipfs.addFromStream(<readable-stream>, (err, result) => {
  if (err) {
    throw err
  }
  console.log(result)
})
```

#### `cat`

> Returns a file addressed by a valid IPFS Path.

##### `ipfs.cat(ipfsPath, [options], [callback])`

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
  - `offset` is an optional byte offset to start the stream at
  - `length` is an optional number of bytes to read from the stream

`callback` must follow `function (err, file) {}` signature, where `err` is an error if the operation was not successful and `file` is a [Buffer][b]

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.cat(ipfsPath, function (err, file) {
  if (err) {
    throw err
  }

  console.log(file.toString('utf8'))
})
```

A great source of [examples][] can be found in the tests for this API.

#### `catReadableStream`

> Returns a [Readable Stream][rs] containing the contents of a file addressed by a valid IPFS Path.

##### `ipfs.catReadableStream(ipfsPath, [options])` -> [Readable Stream][rs]

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
  - `offset` is an optional byte offset to start the stream at
  - `length` is an optional number of bytes to read from the stream

Returns a [Readable Stream][rs] with the contents of the file.


```JavaScript
const stream = ipfs.catReadableStream(ipfsPath)
// stream will be a stream containing the data of the file requested
```

A great source of [examples][] can be found in the tests for this API.

#### `catPullStream`

> Returns a [Pull Stream][ps] containing the contents of a file addressed by a valid IPFS Path.

##### `ipfs.catPullStream(ipfsPath, [options])` -> [Pull Stream][rs]

`ipfsPath` can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`options` is an optional object that may contain the following keys:
  - `offset` is an optional byte offset to start the stream at
  - `length` is an optional number of bytes to read from the stream

Returns a [Pull Stream][ps] with the contents of the file.

```JavaScript
const stream = ipfs.catPullStream(ipfsPath)
// stream will be a stream containing the data of the file requested
})
```

A great source of [examples][] can be found in the tests for this API.

#### `get`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path.

##### `ipfs.get(ipfsPath, [callback])`

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

ipfs.get(validCID, function (err, files) {
  files.forEach((file) => {
    console.log(file.path)
    console.log(file.content.toString('utf8'))
  })
})
```

A great source of [examples][] can be found in the tests for this API.

#### `getReadableStream`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path. The files will be yielded as Readable Streams.

##### `ipfs.getReadableStream(ipfsPath)` -> [Readable Stream][rs]

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
const validCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'

const stream = ipfs.getReadableStream(validCID)

stream.on('data', (file) => {
  // write the file's path and contents to standard out
  console.log(file.path)
  if(file.type !== 'dir') {
    file.content.on('data', (data) => {
      console.log(data.toString())
    })
    file.content.resume()
  }
})
```

A great source of [examples][] can be found in the tests for this API.

#### `getPullStream`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path. The files will be yielded as Readable Streams.

##### `ipfs.getPullStream(ipfsPath)` -> [Pull Stream][ps]

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

const stream = ipfs.getReadableStream(validCID)

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

##### `ipfs.ls(ipfsPath, [callback])`

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

ipfs.ls(validCID, function (err, files) {
  files.forEach((file) => {
    console.log(file.path)
  })
})
```

A great source of [examples][] can be found in the tests for this API.

#### `lsReadableStream`

> Lists a directory from IPFS that is addressed by a valid IPFS Path. The list will be yielded as Readable Streams.

##### `ipfs.lsReadableStream(ipfsPath)` -> [Readable Stream][rs]

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

const stream = ipfs.lsReadableStream(validCID)

stream.on('data', (file) => {
  // write the file's path and contents to standard out
  console.log(file.path)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `lsPullStream`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path. The files will be yielded through a Pull Stream.

##### `ipfs.lsPullStream(ipfsPath)` -> [Pull Stream][ps]

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

const stream = ipfs.lsPullStream(validCID)

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

------------------------------------------------------------------------
------------------------------------------------------------------------

## The Files API aka MFS (The Mutable File System)

The Mutable File System (MFS) is a virtual file system on top of IPFS that exposes a Unix like API over a virtual directory. It enables users to write and read from paths without having to worry about updating the graph. It enables things like [ipfs-blob-store](https://github.com/ipfs/ipfs-blob-store) to exist.

#### `files.cp`

> Copy files.

##### `ipfs.files.cp(...from, to, [options], [callback])`

Where:

- `from` is the path(s) of the source to copy.  It might be:
  - An existing MFS path to a file or a directory (e.g. `/my-dir/my-file.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
- `to` is the path of the destination to copy to
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `format` is what type of nodes to write any newly created directories as (default: `dag-pb`)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories. (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk (default: true)
- `callback` is an optional function with the signature `function (error) {}`, where `error` may be an Error that occured if the operation was not successful

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be copied into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
// To copy a file
ipfs.files.cp('/src-file', '/dst-file', (err) => {
  if (err) {
    console.error(err)
  }
})

// To copy a directory
ipfs.files.cp('/src-dir', '/dst-dir', (err) => {
  if (err) {
    console.error(err)
  }
})

// To copy multiple files to a directory
ipfs.files.cp('/src-file1', '/src-file2', '/dst-dir', (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `files.mkdir`

> Make a directory.

##### `ipfs.files.mkdir(path, [options], [callback])`

Where:

- `path` is the path to the directory to make
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist  (default: false)
  - `format` is what type of nodes to write any newly created directories as (default: `dag-pb`)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk  (default: true)
- `callback` is an optional function with the signature `function (error) {}`, where `error` may be an Error that occured if the operation was not successful

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.mkdir('/my/beautiful/directory', (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `files.stat`

> Get file or directory status.

##### `ipfs.files.stat(path, [options], [callback])`

Where:

- `path` is the path to the file or directory to stat
- `options` is an optional Object that might contain the following keys:
  - `hash` is a Boolean value to return only the hash  (default: false)
  - `size` is a Boolean value to return only the size  (default: false)
  - `withLocal` is a Boolean value to compute the amount of the dag that is local, and if possible the total size  (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)
- `callback` is an optional function with the signature `function (error, stats) {}`, where `error` may be an Error that occured if the operation was not successful and `stats` is an Object with the following keys:

  - `hash` is a string with the hash
  - `size` is an integer with the file size in Bytes
  - `cumulativeSize` is an integer with the size of the DAGNodes making up the file in Bytes
  - `type` is a string that can be either `directory` or `file`
  - `blocks` if `type` is `directory`, this is the number of files in the directory. If it is `file` it is the number of blocks that make up the file
  - `withLocality` is a boolean to indicate if locality information are present
  - `local` is a boolean to indicate if the queried dag is fully present locally
  - `sizeLocal` is an integer indicating the cumulative size of the data present locally

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.stat('/file.txt', (err, stats) => {
  console.log(stats)
})

// {
//   hash: 'QmXmJBmnYqXVuicUfn9uDCC8kxCEEzQpsAbeq1iJvLAmVs',
//   size: 60,
//   cumulativeSize: 118,
//   blocks: 1,
//   type: 'file'
// }
```

#### `files.rm`

> Remove a file or directory.

##### `ipfs.files.rm(...paths, [options], [callback])`

Where:

- `paths` are one or more paths to remove
- `options` is an optional Object that might contain the following keys:
  - `recursive` is a Boolean value to decide whether or not to remove directories recursively  (default: false)
- `callback` is an optional function with the signature `function (error) {}`, where `error` may be an Error that occured if the operation was not successful

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
// To remove a file
ipfs.files.rm('/my/beautiful/file.txt', (err) => {
  if (err) {
    console.error(err)
  }
})

// To remove multiple files
ipfs.files.rm('/my/beautiful/file.txt', '/my/other/file.txt', (err) => {
  if (err) {
    console.error(err)
  }
})

// To remove a directory
ipfs.files.rm('/my/beautiful/directory', { recursive: true }, (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `files.read`

> Read a file into a [`Buffer`][b].

##### `ipfs.files.read(path, [options], [callback])`

Where:

- `path` is the path of the file to read and must point to a file (and not a directory)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from  (default: 0)
  - `length` is an Integer with the maximum number of bytes to read (default: Read to end of stream)
- `callback` is an optional function with the signature `function (error, buffer) {}`, where `error` may be an Error that occured if the operation was not successful and `buffer` is a [`Buffer`][b] with the contents of `path`

If no `callback` is passed, a promise is returned.

N.b. this method is likely to result in high memory usage, you should use [files.readReadableStream](#filesreadreadablestream) or [files.readPullStream](#filesreadpullstream) instead where possible.

**Example:**

```JavaScript
ipfs.files.read('/hello-world', (error, buf) => {
  console.log(buf.toString('utf8'))
})

// Hello, World!
```

#### `files.readReadableStream`

> Read a file into a [`ReadableStream`][rs].

##### `ipfs.files.readReadableStream(path, [options])`

Where:

- `path` is the path of the file to read and must point to a file (and not a directory)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from  (default: 0)
  - `length` is an Integer with the maximum number of bytes to read (default: Read to end of stream)

Returns a [`ReadableStream`][rs] with the contents of `path`.

**Example:**

```JavaScript
const stream = ipfs.files.readReadableStream('/hello-world')
stream.on('data', (buf) => console.log(buf.toString('utf8')))

// Hello, World!
```

#### `files.readPullStream`

> Read a file into a [`PullStream`][ps].

##### `ipfs.files.readPullStream(path, [options])`

Where:

- `path` is the path of the file to read and must point to a file (and not a directory)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from (default: 0)
  - `length` is an Integer with the maximum number of bytes to read (default: Read to end of stream)

Returns a [`PullStream`][ps] with the contents of `path`.

**Example:**

```JavaScript
pull(
  ipfs.files.readPullStream('/hello-world'),
  through(buf => console.log(buf.toString('utf8'))),
  collect(err => {})
)

// Hello, World!
```

#### `files.write`

> Write to a file.

##### `ipfs.files.write(path, content, [options], [callback])`

Where:

- `path` is the path of the file to write
- `content` can be:
  - a [`Buffer`][b]
  - a [`PullStream`][ps]
  - a [`ReadableStream`][rs]
  - a [`Blob`][blob] (caveat: will only work in the browser)
  - a string path to a file (caveat: will only work in Node.js)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin writing at (default: 0)
  - `create` is a Boolean to indicate to create the file if it doesn't exist (default: false)
  - `truncate` is a Boolean to indicate if the file should be truncated after writing all the bytes from `content` (default: false)
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `length` is an Integer with the maximum number of bytes to read (default: Read all bytes from `content`)
  - `raw-leaves`: if true, DAG leaves will contain raw file data and not be wrapped in a protobuf (boolean, default false)
  - `cid-version`: the CID version to use when storing the data (storage keys are based on the CID, including it's version) (integer, default 0)
- `callback` is an optional function with the signature `function (error) {}`, where `error` may be an Error that occured if the operation was not successful

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.write('/hello-world', Buffer.from('Hello, world!'), (err) => {
  console.log(err)
})
```

#### `files.mv`

> Move files.

##### `ipfs.files.mv(...from, to, [options], [callback])`

Where:

- `from` is the path(s) of the source to move
- `to` is the path of the destination to move to
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `format` is what type of nodes to write any newly created directories as (default: `dag-pb`)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk (default: true)
- `callback` is an optional function with the signature `function (error) {}`, where `error` may be an Error that occured if the operation was not successful

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be moved into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

All values of `from` will be removed after the operation is complete, unless they are an IPFS path.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.mv('/src-file', '/dst-file', (err) => {
  if (err) {
    console.error(err)
  }
})

ipfs.files.mv('/src-dir', '/dst-dir', (err) => {
  if (err) {
    console.error(err)
  }
})

ipfs.files.mv('/src-file1', '/src-file2', '/dst-dir', (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `files.flush`

> Flush a given path's data to the disk

##### `ipfs.files.flush([...paths], [callback])`

Where:

- `paths` are an optional string paths to flush (default: `/`)
- `callback` is an optional function with the signature `function (error) {}`, where `error` may be an Error that occured if the operation was not successful

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.flush('/', (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `files.ls`

> List directories in the local mutable namespace.

##### `ipfs.files.ls([path], [options], [callback])`

Where:

- `path` is an optional string to show listing for (default: `/`)
- `options` is an optional Object that might contain the following keys:
  - `long` is a Boolean value to decide whether or not to populate `type`, `size` and `hash` (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)
  - `sort` is a Boolean value, if true entries will be sorted by filename (default: false)
- `callback` is an optional function with the signature `function (error, files) {}`, where `error` may be an Error that occured if the operation was not successful and `files` is an array containing Objects that contain the following keys:

  - `name` which is the file's name
  - `type` which is the object's type (`directory` or `file`)
  - `size` the size of the file in bytes
  - `hash` the hash of the file

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.ls('/screenshots', function (err, files) {
  files.forEach((file) => {
    console.log(file.name)
  })
})

// 2018-01-22T18:08:46.775Z.png
// 2018-01-22T18:08:49.184Z.png
```

#### `files.lsReadableStream`

> Lists a directory from the local mutable namespace that is addressed by a valid IPFS Path. The list will be yielded as Readable Streams.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.lsReadableStream([path], [options]) -> [Readable Stream][rs]

Where:

- `path` is an optional string to show listing for (default: `/`)
- `options` is an optional Object that might contain the following keys:
  - `long` is a Boolean value to decide whether or not to populate `type`, `size` and `hash` (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)

It returns a [Readable Stream][rs] in [Object mode](https://nodejs.org/api/stream.html#stream_object_mode) that will yield objects containing the following keys:

  - `name` which is the file's name
  - `type` which is the object's type (`directory` or `file`)
  - `size` the size of the file in bytes
  - `hash` the hash of the file

**Example:**

```JavaScript
const stream = ipfs.lsReadableStream('/some-dir')

stream.on('data', (file) => {
  // write the file's path and contents to standard out
  console.log(file.name)
})
```

#### `files.lsPullStream`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path. The files will be yielded through a Pull Stream.

##### `Go` **WIP**

##### `JavaScript` - ipfs.lsPullStream([path], [options]) -> [Pull Stream][ps]

Where:

- `path` is an optional string to show listing for (default: `/`)
- `options` is an optional Object that might contain the following keys:
  - `long` is a Boolean value to decide whether or not to populate `type`, `size` and `hash` (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)

It returns a [Pull Stream][os] that will yield objects containing the following keys:

  - `name` which is the file's name
  - `type` which is the object's type (`directory` or `file`)
  - `size` the size of the file in bytes
  - `hash` the hash of the file

**Example:**

```JavaScript
pull(
  ipfs.lsPullStream('/some-dir'),
  pull.through(file => {
    console.log(file.name)
  })
  pull.onEnd(...)
)
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/files-regular
[b]: https://www.npmjs.com/package/buffer
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream
[file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[cid]: https://www.npmjs.com/package/cids
[blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob

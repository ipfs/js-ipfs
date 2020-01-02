# Files API

> The files API enables users to use the File System abstraction of IPFS. There are two Files API, one at the top level, the original `add`, `cat`, `get` and `ls`, and another behind the [`files`, also known as MFS](https://github.com/ipfs/specs/issues/98). [We are currently going through a revamping process of these APIs to make them more user-friendly](https://github.com/ipfs/interface-ipfs-core/issues/284).

#### The Regular API
The regular, top-level API for add, cat, get and ls Files on IPFS
  - [add](#add)
  - [addFromFs](#addfromfs)
  - [addFromStream](#addfromstream)
  - [addFromURL](#addfromurl)
  - [addPullStream](#addpullstream)
  - [addReadableStream](#addreadablestream)
  - [cat](#cat)
  - [catPullStream](#catpullstream)
  - [catReadableStream](#catreadablestream)
  - [get](#get)
  - [getPullStream](#getpullstream)
  - [getReadableStream](#getreadablestream)
  - [ls](#ls)
  - [lsPullStream](#lspullstream)
  - [lsReadableStream](#lsreadablestream)

#### The Files API
The Files API, aka MFS (Mutable File System)

_Explore the Mutable File System through interactive coding challenges in our [ProtoSchool tutorial](https://proto.school/#/mutable-file-system/)._
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

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `add`

> Add files and data to IPFS.

##### `ipfs.add(data, [options])`

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

- chunker (string, default `size-262144`): chunking algorithm used to build ipfs DAGs. Available formats:
  - size-{size}
  - rabin
  - rabin-{avg}
  - rabin-{min}-{avg}-{max}
- cidVersion (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including its version).
- cidBase (string, default `base58btc`): Number base to display CIDs in. [The list of all possible values](https://github.com/multiformats/js-multibase/blob/master/src/constants.js).
- enableShardingExperiment: allows to create directories with an unlimited number of entries currently size of unixfs directories is limited by the maximum block size. Note that this is an experimental feature.
- hashAlg || hash (string, default `sha2-256`): multihash hashing algorithm to use. [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343).
- onlyHash (boolean, default false): doesn't actually add the file to IPFS, but rather calculates its hash.
- pin (boolean, default true): pin this object when adding.
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- quiet (boolean, default false): writes a minimal output.
- quieter (boolean, default false): writes only final hash.
- rawLeaves (boolean, default false): if true, DAG leaves will contain raw file data and not be wrapped in a protobuf.
- recursive (boolean, default false): for when a Path is passed, this option can be enabled to add recursively all the files.
- shardSplitThreshold (integer, default 1000): specifies the maximum size of unsharded directory that can be generated.
- silent (boolean, default false): writes no output.
- trickle (boolean, default false): if true will use the trickle DAG format for DAG generation.
  [Trickle definition from go-ipfs documentation](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle).
- wrapWithDirectory (boolean, default false): adds a wrapping node around the content.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects describing the added data |

an array of objects is returned, each of the form:

```JavaScript
{
  path: '/tmp/myfile.txt',
  hash: 'QmHash', // base58 encoded multihash
  size: 123
}
```

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

- cidVersion (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including its version)
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

- cidVersion (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including its version)
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

##### `ipfs.addFromFs(path, [options])`

Reads a file or folder from `path` on the filesystem and adds it to IPFS.

Options:
  - **recursive**: If `path` is a directory, use option `{ recursive: true }` to add the directory and all its sub-directories.
  - **ignore**: To exclude file globs from the directory, use option `{ ignore: ['ignore/this/folder/**', 'and/this/file'] }`.
  - **hidden**: hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects describing the files that were added |

an array of objects is returned, each of the form:

```js
{
  path: 'test-folder',
  hash: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6',
  size: 123
}
```

**Example**

```JavaScript
const results = await ipfs.addFromFs('path/to/a/folder', { recursive: true , ignore: ['subfolder/to/ignore/**']})
console.log(results)
```

#### `addFromURL`

> Add a file from a URL to IPFS

##### `ipfs.addFromURL(url, [options])`

`options` is an optional object that argument that might include the same keys of [`ipfs.add(data, [options])`](#add)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An object describing the added file |

**Example**

```JavaScript
const result = await ipfs.addFromURL('http://example.com/')
console.log('result')
```

#### `addFromStream`

> Add a file from a stream to IPFS

##### `ipfs.addFromStream(stream, [options])`

This is very similar to `ipfs.add({ path:'', content: stream })`. It is like the reverse of cat.

`options` is an optional object that argument that might include the same keys of [`ipfs.add(data, [options])`](#add)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects describing the added data |

an array of objects is returned, each of the form:

```JavaScript
{
  path: '/tmp/myfile.txt',
  hash: 'QmHash', // base58 encoded multihash
  size: 123
}
```

**Example**

```JavaScript
const result = await ipfs.addFromStream(<readable-stream>)
console.log(result)
```

#### `cat`

> Returns a file addressed by a valid IPFS Path.

##### `ipfs.cat(ipfsPath, [options])`

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

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Buffer>` | A [`Buffer`][b] with the contents of `path` |

**Example:**

```JavaScript
const file = await ipfs.cat(ipfsPath) {
console.log(file.toString('utf8'))
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

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] with the contents of the file |

**Example**

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

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [Pull Stream][ps] with the contents of the file |

**Example**

```JavaScript
const stream = ipfs.catPullStream(ipfsPath)
// stream will be a stream containing the data of the file requested
})
```

A great source of [examples][] can be found in the tests for this API.

#### `get`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path.

##### `ipfs.get(ipfsPath)`

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects representing the files |

an array of objects is returned, each of the form:

```js
{
  path: '/tmp/myfile.txt',
  content: <data as a Buffer>
}
```

Here, each `path` corresponds to the name of a file, and `content` is a regular Readable stream with the raw contents of that file.

**Example:**

```JavaScript
const validCID = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

const files = await ipfs.get(validCID)
files.forEach((file) => {
  console.log(file.path)
  console.log(file.content.toString('utf8'))
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

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] in [Object mode](https://nodejs.org/api/stream.html#stream_object_mode) that will yield objects |

the yielded objects are of the form:

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

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [Pull Stream][ps] that will yield objects |

the yielded objects are of the form:

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

##### `ipfs.ls(ipfsPath)`

> **Note:** ipfs.files.ls is currently only for MFS directories. The goal is to converge both functionalities.

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects representing the files |

an array of objects is returned, each of the form:

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

const files = await ipfs.ls(validCID)
files.forEach((file) => {
  console.log(file.path)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `lsReadableStream`

> Lists a directory from IPFS that is addressed by a valid IPFS Path. The list will be yielded as Readable Streams.

##### `ipfs.lsReadableStream(ipfsPath)` -> [Readable Stream][rs]

> **Note:** ipfs.files.ls is currently only for MFS directories. The goal is to converge both functionalities.

ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] in [Object mode](https://nodejs.org/api/stream.html#stream_object_mode) that will yield objects |

the yielded objects are of the form:

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

> **Note:** ipfs.files.ls is currently only for MFS directories. The goal is to converge both functionalities.


ipfsPath can be of type:

- [`cid`][cid] of type:
  - [Buffer][b], the raw Buffer of the cid
  - String, the base58 encoded version of the cid
- String, including the ipfs handler, a cid and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [Pull Stream][ps] that will yield objects |

the yielded objects are of the form:

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

##### `ipfs.files.cp(...from, to, [options])`

Where:

- `from` is the path(s) of the source to copy.  It might be:
  - An existing MFS path to a file or a directory (e.g. `/my-dir/my-file.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `to` is the path of the destination to copy to
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories. (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk (default: true)

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be copied into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

If `from` is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
// To copy a file
await ipfs.files.cp('/src-file', '/dst-file')

// To copy a directory
await ipfs.files.cp('/src-dir', '/dst-dir')

// To copy multiple files to a directory
await ipfs.files.cp('/src-file1', '/src-file2', '/dst-dir')
```

#### `files.mkdir`

> Make a directory.

##### `ipfs.files.mkdir(path, [options])`

Where:

- `path` is the path to the directory to make
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist  (default: false)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk  (default: true)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.mkdir('/my/beautiful/directory')
```

#### `files.stat`

> Get file or directory status.

##### `ipfs.files.stat(path, [options])`

Where:

- `path` is the path to the file or directory to stat. It might be:
  - An existing MFS path to a file or directory (e.g. `/my-dir/a.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `hash` is a Boolean value to return only the hash  (default: false)
  - `size` is a Boolean value to return only the size  (default: false)
  - `withLocal` is a Boolean value to compute the amount of the dag that is local, and if possible the total size  (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the file/directory status |

the returned object has the following keys:

- `hash` is a string with the hash
- `size` is an integer with the file size in Bytes
- `cumulativeSize` is an integer with the size of the DAGNodes making up the file in Bytes
- `type` is a string that can be either `directory` or `file`
- `blocks` if `type` is `directory`, this is the number of files in the directory. If it is `file` it is the number of blocks that make up the file
- `withLocality` is a boolean to indicate if locality information is present
- `local` is a boolean to indicate if the queried dag is fully present locally
- `sizeLocal` is an integer indicating the cumulative size of the data present locally

**Example:**

```JavaScript
const stats = await ipfs.files.stat('/file.txt')
console.log(stats)

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

##### `ipfs.files.rm(...paths, [options])`

Where:

- `paths` are one or more paths to remove
- `options` is an optional Object that might contain the following keys:
  - `recursive` is a Boolean value to decide whether or not to remove directories recursively  (default: false)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
// To remove a file
await ipfs.files.rm('/my/beautiful/file.txt')

// To remove multiple files
await ipfs.files.rm('/my/beautiful/file.txt', '/my/other/file.txt')

// To remove a directory
await ipfs.files.rm('/my/beautiful/directory', { recursive: true })
```

#### `files.read`

> Read a file into a [`Buffer`][b].

##### `ipfs.files.read(path, [options])`

Where:

- `path` is the path of the file to read and must point to a file (and not a directory). It might be:
  - An existing MFS path to a file (e.g. `/my-dir/a.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from  (default: 0)
  - `length` is an Integer with the maximum number of bytes to read (default: Read to the end of stream)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Buffer>` | A [`Buffer`][b] with the contents of `path` |

N.b. this method is likely to result in high memory usage, you should use [files.readReadableStream](#filesreadreadablestream) or [files.readPullStream](#filesreadpullstream) instead where possible.

**Example:**

```JavaScript
const buf = await ipfs.files.read('/hello-world')
console.log(buf.toString('utf8'))

// Hello, World!
```

#### `files.readReadableStream`

> Read a file into a [`ReadableStream`][rs].

##### `ipfs.files.readReadableStream(path, [options])`

Where:

- `path` is the path of the file to read and must point to a file (and not a directory). It might be:
  - An existing MFS path to a file (e.g. `/my-dir/a.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from  (default: 0)
  - `length` is an Integer with the maximum number of bytes to read (default: Read to the end of stream)

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] with the contents of `path` |

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

- `path` is the path of the file to read and must point to a file (and not a directory). It might be:
  - An existing MFS path to a file (e.g. `/my-dir/a.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from (default: 0)
  - `length` is an Integer with the maximum number of bytes to read (default: Read to the end of stream)

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [`PullStream`][ps] with the contents of `path` |

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

##### `ipfs.files.write(path, content, [options])`

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
  - `rawLeaves`: if true, DAG leaves will contain raw file data and not be wrapped in a protobuf (boolean, default false)
  - `cidVersion`: the CID version to use when storing the data (storage keys are based on the CID, including its version) (integer, default 0)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.write('/hello-world', Buffer.from('Hello, world!'))
```

#### `files.mv`

> Move files.

##### `ipfs.files.mv(...from, to, [options])`

Where:

- `from` is the path(s) of the source to move
- `to` is the path of the destination to move to
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk (default: true)

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be moved into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

If `from` is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.

All values of `from` will be removed after the operation is complete unless they are an IPFS path.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.mv('/src-file', '/dst-file')

await ipfs.files.mv('/src-dir', '/dst-dir')

await ipfs.files.mv('/src-file1', '/src-file2', '/dst-dir')
```

#### `files.flush`

> Flush a given path's data to the disk

##### `ipfs.files.flush([...paths])`

Where:

- `paths` are optional string paths to flush (default: `/`)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If successfully copied. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.flush('/')
```

#### `files.ls`

> List directories in the local mutable namespace.

##### `ipfs.files.ls([path], [options])`

Where:

- `path` is an optional string to show listing for (default: `/`). It might be:
  - An existing MFS path to a directory (e.g. `/my-dir`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `long` is a Boolean value to decide whether or not to populate `type`, `size` and `hash` (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)
  - `sort` is a Boolean value. If true entries will be sorted by filename (default: false)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects representing the files |

each object contains the following keys:

- `name` which is the file's name
- `type` which is the object's type (`directory` or `file`)
- `size` the size of the file in bytes
- `hash` the hash of the file

**Example:**

```JavaScript
const files = await ipfs.files.ls('/screenshots')

files.forEach((file) => {
	console.log(file.name)
})

// 2018-01-22T18:08:46.775Z.png
// 2018-01-22T18:08:49.184Z.png
```

#### `files.lsReadableStream`

> Lists a directory from the local mutable namespace that is addressed by a valid IPFS Path. The list will be yielded as Readable Streams.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.lsReadableStream([path], [options]) -> [Readable Stream][rs]

Where:

- `path` is an optional string to show listing for (default: `/`). It might be:
  - An existing MFS path to a directory (e.g. `/my-dir`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `long` is a Boolean value to decide whether or not to populate `type`, `size` and `hash` (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] in [Object mode](https://nodejs.org/api/stream.html#stream_object_mode) that will yield objects |

the yielded objects contain the following keys:

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

- `path` is an optional string to show listing for (default: `/`). It might be:
  - An existing MFS path to a directory (e.g. `/my-dir`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `long` is a Boolean value to decide whether or not to populate `type`, `size` and `hash` (default: false)
  - `cidBase` is which number base to use to format hashes - e.g. `base32`, `base64` etc (default: `base58btc`)

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [Pull Stream][os] that will yield objects |

the yielded objects contain the following keys:

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

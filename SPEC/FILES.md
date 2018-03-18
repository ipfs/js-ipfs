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
const validCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'

const stream = ipfs.files.getReadableStream(validCID)

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

ipfs.ls(validCID, function (err, files) {
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

const stream = ipfs.files.lsPullStream(validCID)

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

--------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------

Mutable File System
===================

The Mutable File System (MFS) is a virtual file system on top of IPFS that exposes a Unix like API over a virtual directory. It enables users to write and read from paths without having to worry about updating the graph. It enables things like [ipfs-blob-store](https://github.com/ipfs/ipfs-blob-store) to exist.


#### `cp`

> Copy files.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.cp([from, to], [callback])

Where:

- `from` is the path of the source object to copy.
- `to` is the path of the destination object to copy to.

`callback` must follow the `function (err) {}` signature, where `err` is an Error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.cp(['/src-file', '/dst-file'], (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `mkdir`

> Make a directory.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.mkdir(path, [options, callback])

Where:

- `path` is the path to the directory to make.
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist.

`callback` must follow the `function (err) {}` signature, where `err` is an Error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.mkdir('/my/beautiful/directory', (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `stat`

> Get file or directory status.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.stat(path, [options, callback])

Where:

- `path` is the path to the directory to stat.
- `options` is an optional Object that might contain the following keys:
  - `hash` is a Boolean value to return only the hash.
  - `size` is a Boolean value to return only the size.
  - `withLocal` is a Boolean value to compute the amount of the dag that is local, and if possible the total size.

`callback` must follow the `function (err, stat) {}` signature, where `err` is an Error if the operation was not successful and `stat` is an Object with the following keys:

- `hash` is a string with the hash.
- `size` is an integer with the size in Bytes.
- `cumulativeSize` is an integer with the cumulative size in Bytes.
- `blocks` is an integer indicating the number of blocks.
- `type` is a string that can be either `directory` or `file`.
- `withLocality` is a boolean to indicate if locality information are present.
- `local` is a boolean to indicate if the queried dag is fully present locally.
- `sizeLocal` is an integer indicating the cumulative size of the data present locally.


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

#### `rm`

> Remove a file or directory.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.rm(path, [options, callback])

Where:

- `path` is the path of the object to remove.
- `options` is an optional Object that might contain the following keys:
  - `recursive` is a Boolean value to decide whether or not to remove directories recursively.

`callback` must follow the `function (err) {}` signature, where `err` is an Error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
// To remove a file
ipfs.files.rm('/my/beautiful/file.txt', (err) => {
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

#### `read`

> Read a file.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.read(path, [options, callback])

Where:

- `path` is the path of the object to read.
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from.
  - `count` is an Integer with the maximum number of bytes to read.

`callback` must follow the `function (err, buf) {}` signature, where `err` is an Error if the operation was not successful and `buf` is a Buffer with the contents of `path`.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.read('/hello-world', (err, buf) => {
  console.log(buf.toString())
})

// Hello, World!
```

#### `write`

> Write to a file.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.write(path, content, [options, callback])

Where:

- `path` is the path of the object to write.
- `content` can be:
  - a Buffer instance.
  - a Path (caveat: will only work in Node.js).
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin writing at.
  - `create` is a Boolean to indicate to create the file if it doesn't exist.
  - `truncate` is a Boolean to indicate if the file should be truncated to size 0 before writing.
  - `count` is an Integer with the maximum number of bytes to read.

`callback` must follow the `function (err) {}` signature, where `err` is an Error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.write('/hello-world', Buffer.from('Hello, world!'), (err) => {
  console.log(err)
})
```

#### `mv`

> Move files.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.mv([from, to], [callback])

Where:

- `from` is the path of the source object to move.
- `to` is the path of the destination object to move to.

`callback` must follow the `function (err) {}` signature, where `err` is an Error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.mv(['/src-file', '/dst-file'], (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `flush`

> Flush a given path's data to the disk

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.flush([path, callback])

Where:

- `path` is the path to flush. Default is `/`.

`callback` must follow the `function (err) {}` signature, where `err` is an Error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.flush('/', (err) => {
  if (err) {
    console.error(err)
  }
})
```

#### `ls`

> List directories in the local mutable namespace.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.ls([path, options, callback])

Where:

- `path` is the path to show listing for. Defaults to `/`.
- `options` is an optional Object that might contain the following keys:
  - `l` is a Boolean value o use long listing format.
  
`callback` must follow `function (err, files) {}` signature, where `err` is an error if the operation was not successful. `files` is an array containing Objects that contain the following keys:

- `name` which is the file's name.
- `type` which i the object's type (`directory` or `file`).
- `size` the size of the file in bytes.
- `hash` the hash of the file.

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

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/files.js
[b]: https://www.npmjs.com/package/buffer
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream
[cid]: https://www.npmjs.com/package/cids

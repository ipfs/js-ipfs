files API
=========

#### `add`

> Add files and data to IPFS.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.add(data, [options], [callback])

Where `data` may be

- an array of objects, each of the form
```JavaScript
{
  path: '/tmp/myfile.txt',
  content: (Buffer or Readable stream)
}
```
- a `Buffer` instance
- a `Readable` stream

If no `content` is passed, then the path is treated as an empty directory

`options` is an optional object argument that might include the following keys:

- cid-version (integer, default 0): the CID version to use when storing the data (storage keys are based on the CID, including it's version)
- progress (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
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
  // 'files' will be an array of objects
})
```

A great source of [examples][] can be found in the tests for this API.

#### `createAddStream`

> Add files and data to IPFS using a transform stream.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.createAddStream([options], [callback])

Provides a Transform stream, where objects can be written of the forms

```js
{
  path: '/tmp/myfile.txt',
  content: (Buffer or Readable stream)
}
```

`options` is an optional object argument containing the [DAG importer options](https://github.com/ipfs/js-ipfs-unixfs-engine#importer-api).

`callback` must follow `function (err, stream) {}` signature, where `err` is an
error if the operation was not successful. `stream` will be a Transform stream,
to which tuples like the above two object formats can be written and [DAGNode][]
objects will be outputted.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.files.createAddStream(function (err, stream) {
  stream.on('data', function (file) {
    // 'file' will be of the form
    // {
    //   path: '/tmp/myfile.txt',
    //   hash: 'QmHash' // base58 encoded multihash
    //   size: 123
    // }
  })

  stream.write({
    path: <path to file>,
    content: <buffer or readable stream>
  })
  // write as many as you want

  stream.end()
})
```

A great source of [examples][] can be found in the tests for this API.

#### `cat`

> Streams the file at the given IPFS multihash.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.cat(ipfsPath, [callback])

ipfsPath can be of type:

- `multihash` is a [multihash][] which can be passed as
  - Buffer, the raw Buffer of the multihash
  - String, the base58 encoded version of the multihash
- String, including the ipfs handler, a multihash and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`callback` must follow `function (err, stream) {}` signature, where `err` is an error if the operation was not successful and `stream` is a readable stream of the file.

If no `callback` is passed, a promise is returned.

```JavaScript
ipfs.files.cat(ipfsPath, function (err, file) {
  // file will be a stream containing the data of the file requested
})
```

A great source of [examples][] can be found in the tests for this API.

#### `get`

> Get [UnixFS][] files from IPFS.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.get(ipfsPath, [callback])

ipfsPath can be of type:

- `multihash` is a [multihash][] which can be passed as
  - Buffer, the raw Buffer of the multihash
  - String, the base58 encoded version of the multihash
- String, including the ipfs handler, a multihash and a path to traverse to, ie:
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`callback` must follow `function (err, stream) {}` signature, where `err` is an
error if the operation was not successful. `stream` will be a Readable stream in
[*object mode*](https://nodejs.org/api/stream.html#stream_object_mode),
outputting objects of the form

```js
{
  path: '/tmp/myfile.txt',
  content: <Readable stream>
}
```

Here, each `path` corresponds to the name of a file, and `content` is a regular
Readable stream with the raw contents of that file.

If no `callback` is passed, a promise is returned with the Readable stream.

**Example:**

```JavaScript
const multihashStr = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

ipfs.files.get(multihashStr, function (err, stream) {
  stream.on('data', (file) => {
    // write the file's path and contents to standard out
    console.log(file.path)
    file.content.pipe(process.stdout)
  })
})
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/files.js

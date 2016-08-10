files API
=========

#### `add`

> Add files and data to IPFS.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.add(data, [callback])

Where `data` may be

- an array of objects, each of the form
```js
{
  path: '/tmp/myfile.txt',
  content: (Buffer or Readable stream)
}
```
- a `Buffer` instance
- a `Readable` stream

If no `content` is passed, then the path is treated as an empty directory

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

```js
{
  path: '/tmp/myfile.txt',
  hash: 'QmHash', // base58 encoded multihash
  size: 123
}
```

If no `callback` is passed, a promise is returned.

Example:

```js
var files = [
  {
    path: '/tmp/myfile.txt',
    content: (Buffer or Readable stream)
  }
]
ipfs.files.add(files, function (err, files) {
  // 'files' will be an array of objects
})
```


#### `createAddStream`

> Add files and data to IPFS using a transform stream.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.createAddStream([callback])

Provides a Transform stream, where objects can be written of the forms

```js
{
  path: '/tmp/myfile.txt',
  content: (Buffer or Readable stream)
}
```

`callback` must follow `function (err, stream) {}` signature, where `err` is an
error if the operation was not successful. `stream` will be a Transform stream,
to which tuples like the above two object formats can be written and [DAGNode][]
objects will be outputted.

If no `callback` is passed, a promise is returned.

```js
ipfs.files.createAddStream(function (err, stream) {
  stream.on('data', function (file) {
    // 'file' will be of the form
    // {
    //   path: '/tmp/myfile.txt',
    //   hash: 'QmHash' // base58 encoded multihash
    //   size: 123
    // }
  })

  stream.write({path: <path to file>, content: <buffer or readable stream>})
  // write as many as you want

  stream.end()
})
```




#### `cat`

> Streams the file at the given IPFS multihash.

##### `Go` **WIP**

##### `JavaScript` - ipfs.cat(multihash, [callback])

`multihash` is a [multihash][] which can be passed as

- Buffer, the raw Buffer of the multihash 
- String, the base58 encoded version of the multihash

`callback` must follow `function (err, stream) {}` signature, where `err` is an error if the operation was not successful and `stream` is a readable stream of the file.

If no `callback` is passed, a promise is returned.

```js
ipfs.files.cat(multihash, function (err, file) {
  // file will be a stream containing the data of the file requested
})
```


#### `get`
> Get [UnixFS][] files from IPFS.

##### `Go` **WIP**

##### `JavaScript` - ipfs.files.get(hash, [callback])

Where `hash` is an IPFS multiaddress or multihash.

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

Example:

```js
var multiaddr = '/ipfs/QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'
ipfs.files.get(multiaddr, function (err, stream) {
  stream.on('data', (file) => {
    // write the file's path and contents to standard out
    console.log(file.path)
    file.content.pipe(process.stdout)
  })
})
```


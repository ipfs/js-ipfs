# Files API <!-- omit in toc -->

> The files API enables users to use the File System abstraction of IPFS. There are two Files API, one at the top level, the original `add`, `cat`, `get` and `ls`, and another behind the [`files`, also known as MFS](https://docs.ipfs.io/guides/concepts/mfs/)

_Explore the Mutable File System through interactive coding challenges in our [ProtoSchool tutorial](https://proto.school/#/mutable-file-system/)._

- [The Regular API](#the-regular-api)
  - [`ipfs.add(data, [options])`](#ipfsadddata-options)
    - [Parameters](#parameters)
      - [FileObject](#fileobject)
      - [FileContent](#filecontent)
    - [Options](#options)
    - [Returns](#returns)
    - [Example](#example)
  - [`ipfs.addAll(source, [options])`](#ipfsaddallsource-options)
    - [Parameters](#parameters-1)
      - [FileStream](#filestream)
    - [Options](#options-1)
    - [Returns](#returns-1)
    - [Example](#example-1)
    - [Notes](#notes)
      - [Chunking options](#chunking-options)
      - [Hash algorithms](#hash-algorithms)
      - [Importing files from the file system](#importing-files-from-the-file-system)
      - [Importing a file from a URL](#importing-a-file-from-a-url)
  - [`ipfs.cat(ipfsPath, [options])`](#ipfscatipfspath-options)
    - [Parameters](#parameters-2)
    - [Options](#options-2)
    - [Returns](#returns-2)
    - [Example](#example-2)
  - [`ipfs.get(ipfsPath, [options])`](#ipfsgetipfspath-options)
    - [Parameters](#parameters-3)
    - [Options](#options-3)
    - [Returns](#returns-3)
    - [Example](#example-3)
  - [`ipfs.ls(ipfsPath)`](#ipfslsipfspath)
    - [Parameters](#parameters-4)
    - [Options](#options-4)
    - [Returns](#returns-4)
    - [Example](#example-4)
- [The Mutable Files API](#the-mutable-files-api)
  - [`ipfs.files.chmod(path, mode, [options])`](#ipfsfileschmodpath-mode-options)
    - [Parameters](#parameters-5)
    - [Options](#options-5)
    - [Returns](#returns-5)
    - [Example](#example-5)
  - [`ipfs.files.cp(...from, to, [options])`](#ipfsfilescpfrom-to-options)
    - [Parameters](#parameters-6)
    - [Options](#options-6)
    - [Returns](#returns-6)
    - [Example](#example-6)
    - [Notes](#notes-1)
  - [`ipfs.files.mkdir(path, [options])`](#ipfsfilesmkdirpath-options)
    - [Parameters](#parameters-7)
    - [Options](#options-7)
    - [Returns](#returns-7)
    - [Example](#example-7)
  - [`ipfs.files.stat(path, [options])`](#ipfsfilesstatpath-options)
    - [Parameters](#parameters-8)
    - [Options](#options-8)
    - [Returns](#returns-8)
    - [Example](#example-8)
  - [`ipfs.files.touch(path, [options])`](#ipfsfilestouchpath-options)
    - [Parameters](#parameters-9)
    - [Options](#options-9)
    - [Returns](#returns-9)
    - [Example](#example-9)
  - [`ipfs.files.rm(path, [options])`](#ipfsfilesrmpath-options)
    - [Parameters](#parameters-10)
    - [Options](#options-10)
    - [Returns](#returns-10)
    - [Example](#example-10)
  - [`ipfs.files.read(path, [options])`](#ipfsfilesreadpath-options)
    - [Parameters](#parameters-11)
    - [Options](#options-11)
    - [Returns](#returns-11)
    - [Example](#example-11)
  - [`ipfs.files.write(path, content, [options])`](#ipfsfileswritepath-content-options)
    - [Parameters](#parameters-12)
    - [Options](#options-12)
    - [Returns](#returns-12)
    - [Example](#example-12)
  - [`ipfs.files.mv(...from, to, [options])`](#ipfsfilesmvfrom-to-options)
    - [Parameters](#parameters-13)
    - [Options](#options-13)
    - [Returns](#returns-13)
    - [Example](#example-13)
    - [Notes](#notes-2)
  - [`ipfs.files.flush(path, [options])`](#ipfsfilesflushpath-options)
    - [Parameters](#parameters-14)
    - [Options](#options-14)
    - [Returns](#returns-14)
    - [Example](#example-14)
  - [`ipfs.files.ls(path, [options])`](#ipfsfileslspath-options)
    - [Parameters](#parameters-15)
    - [Options](#options-15)
    - [Returns](#returns-15)
    - [Example](#example-15)

## The Regular API
The regular, top-level API for add, cat, get and ls Files on IPFS

### `ipfs.add(data, [options])`

> Import a file or data into IPFS.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | Object | Data to import (see below) |

`data` may be:

* `FileContent` (see below for definition)
* `FileObject` (see below for definition)

##### FileObject

`FileObject` is a plain JS object of the following form:

```js
{
  // The path you want the file to be accessible at from the root CID _after_ it has been added
  path?: string
  // The contents of the file (see below for definition)
  content?: FileContent
  // File mode to store the entry with (see https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation)
  mode?: number | string
  // The modification time of the entry (see below for definition)
  mtime?: UnixTime
}
```

If no `path` is specified, then the item will be added to the root level and will be given a name according to it's CID.

If no `content` is passed, then the item is treated as an empty directory.

One of `path` or `content` _must_ be passed.

Both `mode` and `mtime` are optional and will result in different [CID][]s for the same file if passed.

`mode` will have a default value applied if not set, see [UnixFS Metadata](https://github.com/ipfs/specs/blob/master/UNIXFS.md#metadata) for further discussion.

##### FileContent

`FileContent` is one of the following types:

```js
Uint8Array | Blob | String | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>
```

`UnixTime` is one of the following types:

```js
Date | { secs: number, nsecs?: number } | number[]
```

As an object, `secs` is the number of seconds since (positive) or before (negative) the Unix Epoch began and `nsecs` is the number of nanoseconds since the last full second.

As an array of numbers, it must have two elements, as per the output of [`process.hrtime()`](https://nodejs.org/dist/latest/docs/api/process.html#process_process_hrtime_time).

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| chunker | `String` | `'size-262144'` | chunking algorithm used to build ipfs DAGs |
| cidVersion | `Number` | `0` | the CID version to use when storing the data |
| hashAlg | `String` | `'sha2-256'` | multihash hashing algorithm to use |
| onlyHash | `boolean` | `false` | If true, will not add blocks to the blockstore |
| pin | `boolean` | `true` | pin this object when adding |
| progress | function | `undefined` | a function that will be called with the number of bytes added as a file is added to ipfs and the path of the file being added |
| rawLeaves | `boolean` | `false` | if true, DAG leaves will contain raw file data and not be wrapped in a protobuf |
| trickle | `boolean` | `false` | if true will use the [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle) format for DAG generation |
| wrapWithDirectory | `boolean` | `false` | Adds a wrapping node around the content |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<UnixFSEntry>` | A object describing the added data |

Each yielded object is of the form:

```JavaScript
{
  path: '/tmp/myfile.txt',
  cid: CID('QmHash'),
  mode: Number, // implicit if not provided - 0644 for files, 0755 for directories
  mtime?: { secs: Number, nsecs: Number },
  size: 123
}
```

#### Example

```js
const file = {
  path: '/tmp/myfile.txt',
  content: 'ABC'
}

const result = await ipfs.add(file)

console.info(result)

/*
Prints:
{
  "path": "tmp",
  "cid": CID("QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg"),
  "mode": 493,
  "mtime": { secs: Number, nsecs: Number },
  "size": 67
}
*/
```

Now [ipfs.io/ipfs/Qm..pg/myfile.txt](https://ipfs.io/ipfs/QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg/myfile.txt) returns the "ABC" string.

### `ipfs.addAll(source, [options])`

> Import multiple files and data into IPFS.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| source | [FileStream<FileContent\|FileObject>](#filestream) | Data to import (see below) |

##### FileStream

`FileStream` is a stream of [FileContent](#filecontent) or [FileObject](#fileobject) entries of the type:

```js
Iterable<FileContent|FileObject> | AsyncIterable<FileContent|FileObject> | ReadableStream<FileContent|FileObject>
```

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| chunker | `string` | `'size-262144'` | chunking algorithm used to build ipfs DAGs |
| cidVersion | `number` | `0` | the CID version to use when storing the data |
| enableShardingExperiment | `boolean` | `false` |  allows to create directories with an unlimited number of entries currently size of unixfs directories is limited by the maximum block size. Note that this is an experimental feature |
| hashAlg | `String` | `'sha2-256'` | multihash hashing algorithm to use |
| onlyHash | `boolean` | `false` | If true, will not add blocks to the blockstore |
| pin | `boolean` | `true` | pin this object when adding |
| progress | function | `undefined` | a function that will be called with the number of bytes added as a file is added to ipfs and the path of the file being added |
| rawLeaves | `boolean` | `false` | if true, DAG leaves will contain raw file data and not be wrapped in a protobuf |
| shardSplitThreshold | `Number` | `1000` | Directories with more than this number of files will be created as HAMT-sharded directories |
| trickle | `boolean` | `false` | if true will use the [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle) format for DAG generation |
| wrapWithDirectory | `boolean` | `false` | Adds a wrapping node around the content |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<UnixFSEntry>` | An async iterable that yields objects describing the added data |

Each yielded object is of the form:

```JavaScript
{
  path: '/tmp/myfile.txt',
  cid: CID('QmHash'),
  mode: Number, // implicit if not provided - 0644 for files, 0755 for directories
  mtime?: { secs: Number, nsecs: Number },
  size: 123
}
```

#### Example

```js
const files = [{
  path: '/tmp/myfile.txt',
  content: 'ABC'
}]

for await (const result of ipfs.addAll(files)) {
  console.log(result)
}

/*
Prints out objects like:

{
  "path": "tmp",
  "cid": CID("QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg"),
  "mode": 493,
  "mtime": { secs: Number, nsecs: Number },
  "size": 67
}

{
  "path": "/tmp/myfile.txt",
  "cid": CID("QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW"),
  "mode": 420,
  "mtime": { secs: Number, nsecs: Number },
  "size": 11
}
*/
```

Now [ipfs.io/ipfs/Qm...WW](https://ipfs.io/ipfs/QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW) returns the "ABC" string.

#### Notes

##### Chunking options

The `chunker` option can be one of the following formats:
  - size-{size}
  - rabin
  - rabin-{avg}
  - rabin-{min}-{avg}-{max}

`size-*` will result in fixed-size chunks, `rabin(-*)` will use [rabin fingerprinting](https://en.wikipedia.org/wiki/Rabin_fingerprint) to potentially generate variable size chunks.

##### Hash algorithms

See the [multihash](https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343) module for the list of all possible values.

##### Importing files from the file system

Both js-ipfs and js-ipfs-http-client export a utility to make importing files from the file system easier (Note: it not available in the browser).

```js
import { create, globSource } from 'ipfs'

const ipfs = await create()

//options specific to globSource
const globSourceOptions = {
  recursive: true
};

//example options to pass to IPFS
const addOptions = {
  pin: true,
  wrapWithDirectory: true,
  timeout: 10000
};

for await (const file of ipfs.addAll(globSource('./docs', globSourceOptions), addOptions)) {
  console.log(file)
}

/*
{
  path: 'docs/assets/anchor.js',
  cid: CID('QmVHxRocoWgUChLEvfEyDuuD6qJ4PhdDL2dTLcpUy3dSC2'),
  size: 15347
}
{
  path: 'docs/assets/bass-addons.css',
  hash: CID('QmPiLWKd6yseMWDTgHegb8T7wVS7zWGYgyvfj7dGNt2viQ'),
  size: 232
}
...
*/
```

##### Importing a file from a URL

Both js-ipfs and js-ipfs-http-client export a utility to make importing a file from a URL easier.

```js
import { create, urlSource } from 'ipfs'

const ipfs = await create()

const file = await ipfs.add(urlSource('https://ipfs.io/images/ipfs-logo.svg'))
console.log(file)

/*
{
  path: 'ipfs-logo.svg',
  cid: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
}
*/
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/add.js) can be found in the tests for this API.

### `ipfs.cat(ipfsPath, [options])`

> Returns a file addressed by a valid IPFS Path.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ipfsPath | String or [CID][] | An [IPFS path][] or CID to export |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| offset | `Number` | `undefined` | An offset to start reading the file from |
| length | `Number` | `undefined` | An optional max length to read from the file |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Uint8Array>` | An async iterable that yields `Uint8Array` objects with the contents of `path` |

#### Example

```JavaScript
for await (const chunk of ipfs.cat(ipfsPath)) {
  console.info(chunk)
}
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/cat.js) can be found in the tests for this API.

### `ipfs.get(ipfsPath, [options])`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ipfsPath | String or [CID][] | An [IPFS path][] or CID to export |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| archive | `boolean` | `undefined` | Return the file/directory in a tarball |
| compress | `boolean` | `false` | Gzip the returned stream |
| compressionLevel | `Number` | `undefined` | How much compression to apply (1-9) |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Uint8Array>` | An async iterable that yields bytes |

What is streamed as a response depends on the options passed and what the `ipfsPath` resolves to.

1. If `ipfsPath` resolves to a file:
   * By default you will get a tarball containing the file
   * Pass `compress: true` (and an optional `compressionLevel`) to instead get the gzipped file contents
   * Pass `compress: true` (and an optional `compressionLevel`) AND `archive: true` to get a gzipped tarball containing the file
2. If `ipfsPath` resolves to a directory:
   * By default you will get a tarball containing the contents of the directory
   * Passing `compress: true` will cause an error
   * Pass `compress: true` (and an optional `compressionLevel`) AND `archive: true` to get a gzipped tarball containing the contents of the directory

#### Example

```JavaScript
const cid = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

for await (const buf of ipfs.get(cid)) {
  // do something with buf
}
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/get.js) can be found in the tests for this API.

### `ipfs.ls(ipfsPath)`

> Lists a directory from IPFS that is addressed by a valid IPFS Path.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ipfsPath | String or [CID][] | An [IPFS path][] or CID to list |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the files |

Each yielded object is of the form:

```js
{
  depth: 1,
  name: 'alice.txt',
  path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
  size: 11696,
  cid: CID('QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi'),
  type: 'file',
  mode: Number, // implicit if not provided - 0644 for files, 0755 for directories
  mtime?: { secs: Number, nsecs: Number }
}
```

#### Example

```JavaScript
const cid = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

for await (const file of ipfs.ls(cid)) {
  console.log(file.path)
}
```

A great source of [examples](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/ls.js) can be found in the tests for this API.

---

## The Mutable Files API

The Mutable File System (MFS) is a virtual file system on top of IPFS that exposes a Unix like API over a virtual directory. It enables users to write and read from paths without having to worry about updating the graph. It enables things like [ipfs-blob-store](https://github.com/ipfs/ipfs-blob-store) to exist.

### `ipfs.files.chmod(path, mode, [options])`

> Change mode for files and directories

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | String or [CID][] | An [MFS Path][], [IPFS path][] or CID to modify |
| mode | String or Number | An integer (e.g. `0o755` or `parseInt('0755', 8)`) or a string modification of the existing mode, e.g. `'a+x'`, `'g-w'`, etc |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `false` | If true `mode` will be applied to the entire tree under `path` |
| flush | `boolean` | `true` | If true the changes will be immediately flushed to disk |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to use for any updated entries |
| cidVersion | `Number` | `0` | The CID version to use for any updated entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

#### Example

```JavaScript
// To give a file -rwxrwxrwx permissions
await ipfs.files.chmod('/path/to/file.txt', parseInt('0777', 8))

// Alternatively
await ipfs.files.chmod('/path/to/file.txt', '+rwx')

// You can omit the leading `0` too
await ipfs.files.chmod('/path/to/file.txt', '777')
```

### `ipfs.files.cp(...from, to, [options])`

> Copy files from one location to another

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | One or more Strings or [CID][]s | An [MFS path][], [IPFS path][] or CID |
| to | `String` | An [MFS path][] |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| parents | `boolean` | `false` | If true, create intermediate directories |
| flush | `boolean` | `true` | If true the changes will be immediately flushed to disk |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to use for any updated entries |
| cidVersion | `Number` | `0` | The CID version to use for any updated entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

#### Example

```JavaScript
// To copy a file
await ipfs.files.cp('/src-file', '/dst-file')

// To copy a directory
await ipfs.files.cp('/src-dir', '/dst-dir')

// To copy multiple files to a directory
await ipfs.files.cp(['/src-file1', '/src-file2'], '/dst-dir')
```

#### Notes

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be copied into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

If `from` is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.

### `ipfs.files.mkdir(path, [options])`

> Make a directory in your MFS

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` | The [MFS path][] to create a directory at |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| parents | `boolean` | `false` | If true, create intermediate directories |
| mode | `Number` | `undefined` | An integer that represents the file mode |
| mtime | `Object` | `undefined` | A Date object, an object with `{ secs, nsecs }` properties where `secs` is the number of seconds since (positive) or before (negative) the Unix Epoch began and `nsecs` is the number of nanoseconds since the last full second, or the output of [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime_time) |
| flush | `boolean` | `true` | If true the changes will be immediately flushed to disk |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to use for any updated entries |
| cidVersion | `Number` | `0` | The CID version to use for any updated entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

#### Example

```JavaScript
await ipfs.files.mkdir('/my/beautiful/directory')
```

### `ipfs.files.stat(path, [options])`

> Get file or directory statistics

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` | The [MFS path][] return statistics from |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| hash | `boolean` | `false` | If true, return only the CID |
| size | `boolean` | `false` | If true, return only the size |
| withLocal | `boolean` | `false` | If true, compute the amount of the DAG that is local and if possible the total size |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the file/directory status |

the returned object has the following keys:

- `cid` a [CID][cid] instance
- `size` is an integer with the file size in Bytes
- `cumulativeSize` is an integer with the size of the DAGNodes making up the file in Bytes
- `type` is a string that can be either `directory` or `file`
- `blocks` if `type` is `directory`, this is the number of files in the directory. If it is `file` it is the number of blocks that make up the file
- `withLocality` is a boolean to indicate if locality information is present
- `local` is a boolean to indicate if the queried dag is fully present locally
- `sizeLocal` is an integer indicating the cumulative size of the data present locally

#### Example

```JavaScript
const stats = await ipfs.files.stat('/file.txt')
console.log(stats)

// {
//   hash: CID('QmXmJBmnYqXVuicUfn9uDCC8kxCEEzQpsAbeq1iJvLAmVs'),
//   size: 60,
//   cumulativeSize: 118,
//   blocks: 1,
//   type: 'file'
// }
```

### `ipfs.files.touch(path, [options])`

> Update the mtime of a file or directory

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` | The [MFS path][] to update the mtime for |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| mtime | `Object` | Now | Either a ` Date` object, an object with `{ sec, nsecs }` properties or the output of `process.hrtime()` |
| flush | `boolean` | `true` | If true the changes will be immediately flushed to disk |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to use for any updated entries |
| cidVersion | `Number` | `0` | The CID version to use for any updated entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

#### Example

```JavaScript
// set the mtime to the current time
await ipfs.files.touch('/path/to/file.txt')

// set the mtime to a specific time
await ipfs.files.touch('/path/to/file.txt', {
  mtime: new Date('May 23, 2014 14:45:14 -0700')
})
```

### `ipfs.files.rm(path, [options])`

> Remove a file or directory.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` or `Array<String>` | One or more [MFS path][]s to remove |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `false` | If true all paths under the specifed path(s) will be removed |
| flush | `boolean` | `true` | If true the changes will be immediately flushed to disk |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to use for any updated entries |
| cidVersion | `Number` | `0` | The CID version to use for any updated entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

#### Example

```JavaScript
// To remove a file
await ipfs.files.rm('/my/beautiful/file.txt')

// To remove multiple files
await ipfs.files.rm(['/my/beautiful/file.txt', '/my/other/file.txt'])

// To remove a directory
await ipfs.files.rm('/my/beautiful/directory', { recursive: true })
```

### `ipfs.files.read(path, [options])`

> Read a file

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` or [CID][] | An [MFS path][], [IPFS Path][] or [CID][] to read |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| offset | `Number` | `undefined` | An offset to start reading the file from |
| length | `Number` | `undefined` | An optional max length to read from the file |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Uint8Array>` | An async iterable that yields `Uint8Array` objects with the contents of `path` |

#### Example

```JavaScript
const chunks = []

for await (const chunk of ipfs.files.read('/hello-world')) {
  chunks.push(chunk)
}

console.log(uint8ArrayConcat(chunks).toString())
// Hello, World!
```

### `ipfs.files.write(path, content, [options])`

> Write to an MFS path

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` | The [MFS path] where you will write to |
| content | `String`, `Uint8Array`, `AsyncIterable<Uint8Array>` or [`Blob`][blob] | The content to write to the path |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| offset | `Number` | `undefined` | An offset to start writing to file at |
| length | `Number` | `undefined` | Optionally limit how many bytes are read from the stream |
| create | `boolean` | `false` | Create the MFS path if it does not exist |
| parents | `boolean` | `false` | Create intermediate MFS paths if they do not exist |
| truncate | `boolean` | `false` | Truncate the file at the MFS path if it would have been larger than the passed `content` |
| rawLeaves | `boolean` | `false ` | If true, DAG leaves will contain raw file data and not be wrapped in a protobuf |
| mode | `Number` | `undefined` | An integer that represents the file mode |
| mtime | `Object` | `undefined` | A Date object, an object with `{ secs, nsecs }` properties where `secs` is the number of seconds since (positive) or before (negative) the Unix Epoch began and `nsecs` is the number of nanoseconds since the last full second, or the output of [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime_time) |
| flush | `boolean` | `true` | If true the changes will be immediately flushed to disk |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to use for any updated entries |
| cidVersion | `Number` | `0` | The CID version to use for any updated entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

#### Example

```JavaScript
await ipfs.files.write('/hello-world', new TextEncoder().encode('Hello, world!'))
```

### `ipfs.files.mv(...from, to, [options])`

> Move files from one location to another

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ...from | `String` | One or more [MFS path][]s to move |
| to | `String` | The location to move files to |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| parents | `boolean` | `false` | Create intermediate MFS paths if they do not exist |
| flush | `boolean` | `true` | If true the changes will be immediately flushed to disk |
| hashAlg | `String` | `'sha2-256'` | The hash algorithm to use for any updated entries |
| cidVersion | `Number` | `0` | The CID version to use for any updated entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

#### Example

```JavaScript
await ipfs.files.mv('/src-file', '/dst-file')

await ipfs.files.mv('/src-dir', '/dst-dir')

await ipfs.files.mv(['/src-file1', '/src-file2'], '/dst-dir')
```

#### Notes

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be moved into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

If `from` is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.

All values of `from` will be removed after the operation is complete unless they are an IPFS path.

### `ipfs.files.flush(path, [options])`

> Flush a given path's data to the disk

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` | The [MFS path][] to flush |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID>` | The CID of the path that has been flushed |

#### Example

```JavaScript
const cid = await ipfs.files.flush('/')
```

### `ipfs.files.ls(path, [options])`

> List directories in the local mutable namespace

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | `String` | The [MFS path][] to list |

#### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

#### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the files |

Each object contains the following keys:

- `name` which is the file's name
- `type` which is the object's type (`directory` or `file`)
- `size` the size of the file in bytes
- `cid` the hash of the file (A [CID][cid] instance)
- `mode` the UnixFS mode as a Number
- `mtime` an objects with numeric `secs` and `nsecs` properties

#### Example

```JavaScript
for await (const file of ipfs.files.ls('/screenshots')) {
  console.log(file.name)
}
// 2018-01-22T18:08:46.775Z.png
// 2018-01-22T18:08:49.184Z.png
```

[b]: https://www.npmjs.com/package/buffer
[file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[cid]: https://www.npmjs.com/package/cids
[blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
[IPFS Path]: https://www.npmjs.com/package/is-ipfs#isipfspathpath
[MFS Path]: https://docs.ipfs.io/guides/concepts/mfs/
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

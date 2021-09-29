# Migrating to the new JS IPFS Core API in 0.48.0 <!-- omit in toc -->

A migration guide for refactoring your application code to use the new JS IPFS core API.

Impact key:

* 🍏 easy - simple refactoring in application code
* 🍋 medium - involved refactoring in application code
* 🍊 hard - complicated refactoring in application code

## Table of Contents <!-- omit in toc -->

- [Migrating from callbacks](#migrating-from-callbacks)
- [Migrating from `PeerId`](#migrating-from-peerid)
- [Migrating from `PeerInfo`](#migrating-from-peerinfo)
- [Migrating to Async Iterables](#migrating-to-async-iterables)
  - [From Node.js Streams](#from-nodejs-streams)
    - [Node.js Readable Streams](#nodejs-readable-streams)
    - [Piping Node.js Streams](#piping-nodejs-streams)
    - [Node.js Transform Streams](#nodejs-transform-streams)
  - [From Pull Streams](#from-pull-streams)
    - [Source Pull Streams](#source-pull-streams)
    - [Pull Stream Pipelines](#pull-stream-pipelines)
    - [Transform Pull Streams](#transform-pull-streams)
  - [From buffering APIs](#from-buffering-apis)
- [Migrating from `addFromFs`](#migrating-from-addfromfs)
- [Migrating from `addFromURL`](#migrating-from-addfromurl)
- [Migrating from `addFromStream`](#migrating-from-addfromstream)

## Migrating from callbacks

Callbacks are no longer supported in the API. If your application primarily uses callbacks you have two main options for migration:

**Impact 🍊**

Switch to using the promise API with async/await. Instead of program continuation in a callback, continuation occurs after the async call and functions from where the call is made are changed to be async functions.

e.g.

```js
function main () {
  ipfs.id((err, res) => {
    console.log(res)
  })
}
main()
```

Becomes:

```js
async function main () {
  const res = await ipfs.id()
  console.log(res)
}
main()
```

**Impact 🍏**

Alternatively you could "callbackify" the API. In this case you use a module to convert the promise API to a callback API either permanently or in an interim period.

e.g.

```js
function main () {
  ipfs.id((err, res) => {
    console.log(res)
  })
}
main()
```

Becomes:

```js
const callbackify = require('callbackify')
const ipfsId = callbackify(ipfs.id)

async function main () {
  ipfsId((err, res) => {
    console.log(res)
  })
}
main()
```

## Migrating from `PeerId`

Libp2p `PeerId` instances are no longer returned from the API. If your application is using the crypto capabilities of [`PeerId`](https://github.com/libp2p/js-peer-id) instances then you'll want to convert the peer ID `string` returned by the new API back into libp2p `PeerId` instances.

**Impact 🍏**

Peer ID strings are also CIDs so converting them is simple:

```js
const peerId = PeerId.createFromB58String(peerIdStr)
```

You can get hold of the `PeerId` class using npm or in a script tag:

```js
import PeerId from 'peer-id'
const peerId = PeerId.createFromB58String(peerIdStr)
```

```html
<script src="https://unpkg.com/peer-id/dist/index.min.js"></script>
<script>
  const peerId = window.PeerId.createFromB58String(peerIdStr)
</script>
```

## Migrating from `PeerInfo`

Libp2p `PeerInfo` instances are no longer returned from the API. Instead, plain objects of the form `{ id: string, addrs: Multiaddr[] }` are returned. To convert these back into a `PeerInfo` instance:

**Impact 🍏**

Instantiate a new `PeerInfo` and add addresses to it:

```js
const peerInfo = new PeerInfo(PeerId.createFromB58String(info.id))
info.addrs.forEach(addr => peerInfo.multiaddrs.add(addr))
```

You can get hold of the `PeerInfo` class using npm or in a script tag:

```js
const PeerInfo = require('peer-info')
import PeerId from 'peer-id'
const peerInfo = new PeerInfo(PeerId.createFromB58String(info.id))
info.addrs.forEach(addr => peerInfo.multiaddrs.add(addr))
```

```html
<script src="https://unpkg.com/peer-info/dist/index.min.js"></script>
<script src="https://unpkg.com/peer-id/dist/index.min.js"></script>
<script>
  const peerInfo = new window.PeerInfo(window.PeerId.createFromB58String(info.id))
  info.addrs.forEach(addr => peerInfo.multiaddrs.add(addr))
</script>
```

## Migrating to Async Iterables

Async Iterables are a language native way of streaming data. The IPFS core API has previously supported two different stream implementations - Pull Streams and Node.js Streams. Similarly to those two different implementations, streaming iterables come in different forms for different purposes:

1. **source** - something that can be consumed. Analogous to a "source" pull stream or a "readable" Node.js stream
2. **sink** - something that consumes (or drains) a source. Analogous to a "sink" pull stream or a "writable" Node.js stream
3. **transform** - both a sink and a source where the values it consumes and the values that can be consumed from it are connected in some way. Analogous to a transform in both Pull and Node.js streams
4. **duplex** - similar to a transform but the values it consumes are not necessarily connected to the values that can be consumed from it

More information and examples here: https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9

List of useful modules for working with async iterables: https://github.com/alanshaw/it-awesome

Note that iterables might gain many helper functions soon: https://github.com/tc39/proposal-iterator-helpers

### From Node.js Streams

#### Node.js Readable Streams

Modern Node.js readable streams are async iterable so there's no changes to any APIs that you'd normally pass a stream to. The `*ReadableStream` APIs have been removed. To migrate from `*ReadableStream` methods, there are a couple of options:

**Impact 🍊**

Use a [for/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop to consume an async iterable.

e.g.

```js
const readable = ipfs.catReadableStream('QmHash')
const decoder = new TextDecoder()

readable.on('data', chunk => {
  console.log(decoder.decode(chunk))
})

readable.on('end', () => {
  console.log('done')
})
```

Becomes:

```js
const source = ipfs.cat('QmHash')
const decoder = new TextDecoder()

for await (const chunk of source) {
  console.log(decoder.decode(chunk))
}

console.log('done')
```

**Impact 🍏**

Convert the async iterable to a readable stream.

e.g.

```js
const readable = ipfs.catReadableStream('QmHash')
const decoder = new TextDecoder()

readable.on('data', chunk => {
  console.log(decoder.decode(chunk))
})

readable.on('end', () => {
  console.log('done')
})
```

Becomes:

```js
import toStream from 'it-to-stream'
const readable = toStream.readable(ipfs.cat('QmHash'))
const decoder = new TextDecoder()

readable.on('data', chunk => {
  console.log(decoder.decode(chunk))
})

readable.on('end', () => {
  console.log('done')
})
```

#### Piping Node.js Streams

Sometimes applications will "pipe" Node.js streams together, using the `.pipe` method or the `pipeline` utility. There are 2 possible migration options:

**Impact 🍊**

Use `it-pipe` and a [for/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop to concat data from an async iterable.

e.g.

```js
const { pipeline, Writable } = require('stream')
const decoder = new TextDecoder()

let data = new Uint8Array(0)
const concat = new Writable({
  write (chunk, enc, cb) {
    data = uint8ArrayConcat([data, chunk])
    cb()
  }
})

pipeline(
  ipfs.catReadableStream('QmHash'),
  concat,
  err => {
    console.log(decoder.decode(chunk))
  }
)
```

Becomes:

```js
const pipe = require('it-pipe')
const decoder = new TextDecoder()

let data = new Uint8Array(0)
const concat = async source => {
  for await (const chunk of source) {
    data = uint8ArrayConcat([data, chunk])
  }
}

const data = await pipe(
  ipfs.cat('QmHash'),
  concat
)

console.log(decoder.decode(data))
```

...which, by the way, could more succinctly be written as:

```js
import toBuffer from 'it-to-buffer'
const decoder = new TextDecoder()
const data = await toBuffer(ipfs.cat('QmHash'))
console.log(decoder.decode(data))
```

**Impact 🍏**

Convert the async iterable to a readable stream.

e.g.

```js
const { pipeline, Writable } = require('stream')
const decoder = new TextDecoder()

let data = new Uint8Array(0)
const concat = new Writable({
  write (chunk, enc, cb) {
    data = uint8ArrayConcat([data, chunk])
    cb()
  }
})

pipeline(
  ipfs.catReadableStream('QmHash'),
  concat,
  err => {
    console.log(decoder.decode(data))
  }
)
```

Becomes:

```js
import toStream from 'it-to-stream'
const { pipeline, Writable } = require('stream')
const decoder = new TextDecoder()

let data = new Uint8Array(0)
const concat = new Writable({
  write (chunk, enc, cb) {
    data = uint8ArrayConcat([data, chunk])
    cb()
  }
})

pipeline(
  toStream.readable(ipfs.cat('QmHash')),
  concat,
  err => {
    console.log(decoder.decode(data))
  }
)
```

#### Node.js Transform Streams

Commonly in Node.js you have a readable stream of a file from the filesystem that you want to add to IPFS. There are 2 possible migration options:

**Impact 🍊**

Use `it-pipe` and a [for/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop to collect all items from an async iterable.

e.g.

```js
import fs from 'fs'
const { pipeline } = require('stream')

const items = []
const all = new Writable({
  objectMode: true,
  write (chunk, enc, cb) {
    items.push(chunk)
    cb()
  }
})

pipeline(
  fs.createReadStream('/path/to/file'),
  ipfs.addReadableStream(),
  all,
  err => {
    console.log(items)
  }
)
```

Becomes:

```js
import fs from 'fs'
const pipe = require('it-pipe')

const items = []
const all = async source => {
  for await (const chunk of source) {
    items.push(chunk)
  }
}

await pipe(
  fs.createReadStream('/path/to/file'), // Because Node.js streams are iterable
  ipfs.add,
  all
)

console.log(items)
```

...which, by the way, could more succinctly be written as:

```js
import fs from 'fs'
const pipe = require('it-pipe')
import all from 'it-all'

const items = await pipe(
  fs.createReadStream('/path/to/file'),
  ipfs.add,
  all
)

console.log(items)
```

**Impact 🍏**

Convert the async iterable to a readable stream.

e.g.

```js
import fs from 'fs'
const { pipeline } = require('stream')

const items = []
const all = new Writable({
  objectMode: true,
  write (chunk, enc, cb) {
    items.push(chunk)
    cb()
  }
})

pipeline(
  fs.createReadStream('/path/to/file'),
  ipfs.addReadableStream(),
  all,
  err => {
    console.log(items)
  }
)
```

Becomes:

```js
import toStream from 'it-to-stream'
import fs from 'fs'
const { pipeline } = require('stream')

const items = []
const all = new Writable({
  objectMode: true,
  write (chunk, enc, cb) {
    items.push(chunk)
    cb()
  }
})

pipeline(
  fs.createReadStream('/path/to/file'),
  toStream.transform(ipfs.add),
  all,
  err => {
    console.log(items)
  }
)
```

### From Pull Streams

#### Source Pull Streams

Pull Streams can no longer be passed to IPFS API methods and the `*PullStream` APIs have been removed. To pass a pull stream directly to an IPFS API method, first convert it to an async iterable using [`pull-stream-to-async-iterator`](https://www.npmjs.com/package/pull-stream-to-async-iterator). To migrate from `*PullStream` methods, there are a couple of options:

**Impact 🍊**

Use a [for/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) loop to consume an async iterable.

e.g.

```js
const decoder = new TextDecoder()

pull(
  ipfs.catPullStream('QmHash'),
  pull.through(chunk => {
    console.log(decoder.decode(data))
  }),
  pull.onEnd(err => {
    console.log('done')
  })
)
```

Becomes:

```js
const decoder = new TextDecoder()

for await (const chunk of ipfs.cat('QmHash')) {
  console.log(decoder.decode(data))
}

console.log('done')
```

**Impact 🍏**

Convert the async iterable to a pull stream.

e.g.

```js
const decoder = new TextDecoder()

pull(
  ipfs.catPullStream('QmHash'),
  pull.through(chunk => {
    console.log(decoder.decode(data))
  }),
  pull.onEnd(err => {
    console.log('done')
  })
)
```

Becomes:

```js
const toPull = require('async-iterator-to-pull-stream')
const decoder = new TextDecoder()

pull(
  toPull.source(ipfs.cat('QmHash')),
  pull.through(chunk => {
    console.log(decoder.decode(data))
  }),
  pull.onEnd(err => {
    console.log('done')
  })
)
```

#### Pull Stream Pipelines

Frequently, applications will use `pull()` to create a pipeline of pull streams.

**Impact 🍊**

Use `it-pipe` and `it-concat` concat data from an async iterable.

e.g.

```js
const decoder = new TextDecoder()

pull(
  ipfs.catPullStream('QmHash'),
  pull.collect((err, chunks) => {
    console.log(decoder.decode(uint8ArrayConcat(chunks)))
  })
)
```

Becomes:

```js
const pipe = require('it-pipe')
import concat from 'it-concat'
const decoder = new TextDecoder()

const data = await pipe(
  ipfs.cat('QmHash'),
  concat
)

console.log(decoder.decode(data))
```

#### Transform Pull Streams

You might have a pull stream source of a file from the filesystem that you want to add to IPFS. There are 2 possible migration options:

**Impact 🍊**

Use `it-pipe` and `it-all` to collect all items from an async iterable.

e.g.

```js
import fs from 'fs'
const toPull = require('stream-to-pull-stream')

pull(
  toPull.source(fs.createReadStream('/path/to/file')),
  ipfs.addPullStream(),
  pull.collect((err, items) => {
    console.log(items)
  })
)
```

Becomes:

```js
import fs from 'fs'

const file = await ipfs.add(fs.createReadStream('/path/to/file'))

console.log(file)
```

**Impact 🍏**

Convert the async iterable to a pull stream.

e.g.

```js
import fs from 'fs'
const toPull = require('stream-to-pull-stream')

pull(
  toPull.source(fs.createReadStream('/path/to/file')),
  ipfs.addPullStream(),
  pull.collect((err, items) => {
    console.log(items)
  })
)
```

Becomes:

```js
import fs from 'fs'
const streamToPull = require('stream-to-pull-stream')
const itToPull = require('async-iterator-to-pull-stream')

pull(
  streamToPull.source(fs.createReadStream('/path/to/file')),
  itToPull.transform(ipfs.add),
  pull.collect((err, items) => {
    console.log(items)
  })
)
```

### From buffering APIs

The old APIs like `ipfs.add`, `ipfs.cat`, `ipfs.ls` and others were "buffering APIs" i.e. they collect all the results into memory before returning them. The new JS core interface APIs are streaming by default in order to reduce memory usage, reduce time to first byte and to provide better feedback. The following are examples of switching from the old `ipfs.add`, `ipfs.cat` and `ipfs.ls` to the new APIs:

**Impact 🍏**

Adding files.

e.g.

```js
const results = await ipfs.addAll([
  { path: 'root/1.txt', content: 'one' },
  { path: 'root/2.txt', content: 'two' }
])

// Note that ALL files have already been added to IPFS
results.forEach(file => {
  console.log(file.path)
})
```

Becomes:

```js
const addSource = ipfs.addAll([
  { path: 'root/1.txt', content: 'one' },
  { path: 'root/2.txt', content: 'two' }
])

for await (const file of addSource) {
  console.log(file.path) // Note these are logged out as they are added
}
```

Alternatively you can buffer up the results using the `it-all` utility:

```js
import all from 'it-all'

const results = await all(ipfs.addAll([
  { path: 'root/1.txt', content: 'one' },
  { path: 'root/2.txt', content: 'two' }
]))

results.forEach(file => {
  console.log(file.path)
})
```

Often you just want the last item (the root directory entry) when adding multiple files to IPFS:

```js
const results = await ipfs.addAll([
  { path: 'root/1.txt', content: 'one' },
  { path: 'root/2.txt', content: 'two' }
])

const lastResult = results[results.length - 1]

console.log(lastResult)
```

Becomes:

```js
const addSource = ipfs.addAll([
  { path: 'root/1.txt', content: 'one' },
  { path: 'root/2.txt', content: 'two' }
])

let lastResult
for await (const file of addSource) {
  lastResult = file
}

console.log(lastResult)
```

Alternatively you can use the `it-last` utility:

```js
const lastResult = await last(ipfs.addAll([
  { path: 'root/1.txt', content: 'one' },
  { path: 'root/2.txt', content: 'two' }
]))

console.log(lastResult)
```

**Impact 🍏**

Reading files.

e.g.

```js
import fs from 'fs'

const data = await ipfs.cat('/ipfs/QmHash')

// Note that here we have read the entire file
// i.e. `data` holds ALL the contents of the file in memory
await fs.writeFile('/tmp/file.iso', data)

console.log('done')
```

Becomes:

```js
const pipe = require('it-pipe')
import toIterable from 'stream-to-it'
import fs from 'fs'

// Note that as chunks arrive they are written to the file and memory can be freed and re-used
await pipe(
  ipfs.cat('/ipfs/QmHash'),
  toIterable.sink(fs.createWriteStream('/tmp/file.iso'))
)

console.log('done')
```

Alternatively you can buffer up the chunks using the `it-concat` utility (not recommended!):

```js
import fs from 'fs'
import concat from 'it-concat'

const data = await concat(ipfs.cat('/ipfs/QmHash'))

await fs.writeFile('/tmp/file.iso', data.slice())

console.log('done')
```

**Impact 🍏**

Listing directory contents.

e.g.

```js
const files = await ipfs.ls('/ipfs/QmHash')

// Note that ALL files in the directory have been read into memory
files.forEach(file => {
  console.log(file.name)
})
```

Becomes:

```js
const filesSource = ipfs.ls('/ipfs/QmHash')

for await (const file of filesSource) {
  console.log(file.name) // Note these are logged out as they are retrieved from the network/disk
}
```

Alternatively you can buffer up the directory listing using the `it-all` utility:

```js
import all from 'it-all'

const results = await all(ipfs.ls('/ipfs/QmHash'))

results.forEach(file => {
  console.log(file.name)
})
```

## Migrating from `addFromFs`

The `addFromFs` API method has been removed and replaced with a helper function `globSource` that is exported from `js-ipfs`/`js-ipfs-http-client`. See the [API docs for `globSource` for more info](https://github.com/ipfs/js-ipfs-http-client/blob/f30031163b9ac4ce2cff34ad4854f24b23cbff0b/README.md#glob-source).

**Impact 🍏**

e.g.

```js
const IpfsHttpClient = require('ipfs-http-client')
const ipfs = IpfsHttpClient()

const files = await ipfs.addFromFs('./docs', { recursive: true })

files.forEach(file => {
  console.log(file)
})
```

Becomes:

```js
const IpfsHttpClient = require('ipfs-http-client')
const { globSource } = IpfsHttpClient
const ipfs = IpfsHttpClient()

for await (const file of ipfs.addAll(globSource('./docs', { recursive: true }))) {
  console.log(file)
}
```

## Migrating from `addFromURL`

The `addFromURL` API method has been removed and replaced with a helper function `urlSource` that is exported from `js-ipfs`/`js-ipfs-http-client`. See the [API docs for `urlSource` for more info](https://github.com/ipfs/js-ipfs-http-client/blob/f30031163b9ac4ce2cff34ad4854f24b23cbff0b/README.md#url-source).

**Impact 🍏**

e.g.

```js
const IpfsHttpClient = require('ipfs-http-client')
const ipfs = IpfsHttpClient()

const files = await ipfs.addFromURL('https://ipfs.io/images/ipfs-logo.svg')

files.forEach(file => {
  console.log(file)
})
```

Becomes:

```js
const IpfsHttpClient = require('ipfs-http-client')
const { urlSource } = IpfsHttpClient
const ipfs = IpfsHttpClient()

const file = await ipfs.add(urlSource('https://ipfs.io/images/ipfs-logo.svg'))

console.log(file)
```

## Migrating from `addFromStream`

The `addFromStream` API method has been removed. This was an alias for `add`.

**Impact 🍏**

e.g.

```js
const IpfsHttpClient = require('ipfs-http-client')
const ipfs = IpfsHttpClient()

const files = await ipfs.addFromStream(fs.createReadStream('/path/to/file.txt'))

files.forEach(file => {
  console.log(file)
})
```

Becomes:

```js
import fs from 'fs'
const ipfs = IpfsHttpClient()

const file = await ipfs.add(fs.createReadStream('/path/to/file.txt'))

console.log(file)
```

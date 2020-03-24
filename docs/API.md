# API <!-- omit in toc -->

`ipfs` can run as part of your program (an in-process node) or as a standalone daemon process that can be communicated with via an HTTP RPC API using the [`ipfs-http-client`](../packages/ipfs-http-api) module.

The http client module can be used to control either a `go-ipfs` or a `js-ipfs` daemon, though the amount of the API implemented in each language varies.

Whether accessed directly or over HTTP, both methods support the full [Core API](#core-api).  In addition other methods are available to construct instances of each module, etc.

## Table of Contents <!-- omit in toc -->

- [Core API](#core-api)
- [ipfs module](#ipfs-module)
- [ipfs-http-client module](#ipfs-http-client-module)
  - [Additional Options](#additional-options)
  - [Instance Utils](#instance-utils)
  - [Static Types and Utils](#static-types-and-utils)
    - [Glob source](#glob-source)
      - [`globSource(path, [options])`](#globsourcepath-options)
      - [Example](#example)
    - [URL source](#url-source)
      - [`urlSource(url)`](#urlsourceurl)
      - [Example](#example-1)

## Core API

The Core API defines the set of operations that are possible to do with an IPFS node.

It is broken up into the following sections:

* [BITSWAP.md](api/BITSWAP.md)
* [BLOCK.md](api/BLOCK.md)
* [BOOTSTRAP.md](api/BOOTSTRAP.md)
* [CONFIG.md]([api/CONFIG.md)
* [DAG.md](api/DAG.md)
* [DHT.md](api/DHT.md)
* [FILES.md](api/FILES.md)
* [KEY.md](api/KEY.md)
* [MISCELLANEOUS.md](api/MISCELLANEOUS.md)
* [NAME.md](api/NAME.md)
* [OBJECT.md](api/OBJECT.md)
* [PIN.md](api/PIN.md)
* [PUBSUB.md](api/PUBSUB.md)
* [REFS.md](api/REFS.md)
* [STATS.md](api/STATS.md)
* [SWARM.md](api/SWARM.md)

## ipfs module

See [IPFS.md](./IPFS.md) for constructor details and instance methods not part of the Core API.

## ipfs-http-client module

These are functions not in the [Core API](#core-api) but that are specific to [`ipfs-http-client`](../packages/ipfs-http-client).

### Additional Options

All core API methods take _additional_ `options` specific to the HTTP API:

* `headers` - An object or [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) instance that can be used to set custom HTTP headers. Note that this option can also be [configured globally](#custom-headers) via the constructor options.
* `signal` - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that can be used to abort the request on demand.
* `timeout` - A number or string specifying a timeout for the request. If the timeout is reached before data is received a [`TimeoutError`](https://github.com/sindresorhus/ky/blob/2f37c3f999efb36db9108893b8b3d4b3a7f5ec45/index.js#L127-L132) is thrown. If a number is specified it is interpreted as milliseconds, if a string is passed, it is intepreted according to [`parse-duration`](https://www.npmjs.com/package/parse-duration). Note that this option can also be [configured globally](#global-timeouts) via the constructor options.
* `searchParams` - An object or [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) instance that can be used to add additional query parameters to the query string sent with each request.

### Instance Utils

- `ipfs.getEndpointConfig()`

Call this on your client instance to return an object containing the `host`, `port`, `protocol` and `api-path`.

### Static Types and Utils

Aside from the default export, `ipfs-http-client` exports various types and utilities that are included in the bundle:

- [`Buffer`](https://www.npmjs.com/package/buffer)
- [`multiaddr`](https://www.npmjs.com/package/multiaddr)
- [`multibase`](https://www.npmjs.com/package/multibase)
- [`multicodec`](https://www.npmjs.com/package/multicodec)
- [`multihash`](https://www.npmjs.com/package/multihashes)
- [`CID`](https://www.npmjs.com/package/cids)
- [`globSource`](https://github.com/ipfs/js-ipfs-utils/blob/master/src/files/glob-source.js) (not available in the browser)
- [`urlSource`](https://github.com/ipfs/js-ipfs-utils/blob/master/src/files/url-source.js)

These can be accessed like this, for example:

```js
const { CID } = require('ipfs-http-client')
// ...or from an es-module:
import { CID } from 'ipfs-http-client'
```

#### Glob source

A utility to allow files on the file system to be easily added to IPFS.

##### `globSource(path, [options])`

- `path`: A path to a single file or directory to glob from
- `options`: Optional options
- `options.recursive`: If `path` is a directory, use option `{ recursive: true }` to add the directory and all its sub-directories.
- `options.ignore`: To exclude file globs from the directory, use option `{ ignore: ['ignore/this/folder/**', 'and/this/file'] }`.
- `options.hidden`: Hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`.

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

##### Example

```js
const IpfsHttpClient = require('ipfs-http-client')
const { globSource } = IpfsHttpClient
const ipfs = IpfsHttpClient()

for await (const file of ipfs.add(globSource('./docs', { recursive: true }))) {
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
  cid: CID('QmPiLWKd6yseMWDTgHegb8T7wVS7zWGYgyvfj7dGNt2viQ'),
  size: 232
}
...
*/
```

#### URL source

A utility to allow content from the internet to be easily added to IPFS.

##### `urlSource(url)`

- `url`: A string URL or [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance to send HTTP GET request to

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

##### Example

```js
const IpfsHttpClient = require('ipfs-http-client')
const { urlSource } = IpfsHttpClient
const ipfs = IpfsHttpClient()

for await (const file of ipfs.add(urlSource('https://ipfs.io/images/ipfs-logo.svg'))) {
  console.log(file)
}
/*
{
  path: 'ipfs-logo.svg',
  cid: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
}
*/
```

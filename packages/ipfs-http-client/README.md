> # ⛔️ DEPRECATED: [js-IPFS](https://github.com/ipfs/js-ipfs) has been superseded by [Helia](https://github.com/ipfs/helia)
>
> 📚 [Learn more about this deprecation](https://github.com/ipfs/js-ipfs/issues/4336) or [how to migrate](https://github.com/ipfs/helia/wiki/Migrating-from-js-IPFS)
>
> ⚠️ If you continue using this repo, please note that security fixes will not be provided

# ipfs-http-client <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-ipfs/test.yml?branch=master\&style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/test.yml?query=branch%3Amaster)

> A client library for the [IPFS HTTP API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) exposed by js-ipfs.


> Note: The client library for the [Kubo RPC API](https://docs.ipfs.tech/reference/kubo/rpc/) has moved into [js-kubo-rpc-client](https://github.com/ipfs/js-kubo-rpc-client).

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Getting Started](#getting-started)
  - [Next Steps](#next-steps)
- [Usage](#usage)
    - [`create([options])`](#createoptions)
    - [Parameters](#parameters)
    - [Options](#options)
    - [Returns](#returns)
    - [Example](#example)
  - [API](#api)
  - [Additional Options](#additional-options)
  - [Instance Utils](#instance-utils)
  - [Static Types and Utils](#static-types-and-utils)
    - [Glob source](#glob-source)
      - [`globSource(path, pattern, [options])`](#globsourcepath-pattern-options)
      - [Example](#example-1)
    - [URL source](#url-source)
      - [`urlSource(url)`](#urlsourceurl)
      - [Example](#example-2)
  - [Running the daemon with the right port](#running-the-daemon-with-the-right-port)
  - [Importing the module and usage](#importing-the-module-and-usage)
  - [In a web browser](#in-a-web-browser)
  - [Custom Headers](#custom-headers)
  - [Infura Header](#infura-header)
  - [Global Timeouts](#global-timeouts)
- [Development](#development)
  - [Testing](#testing)
- [Historical context](#historical-context)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipfs-http-client
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `IpfsHttpClient` in the global namespace.

```html
<script src="https://unpkg.com/ipfs-http-client/dist/index.min.js"></script>
```

<h1 align="center">
  <a href="https://ipfs.io"><img width="650px" src="https://ipfs.io/ipfs/QmQJ68PFMDdAsgCZvA1UVzzn18asVcf7HVvCDgpjiSCAse" alt="IPFS http client lib logo" /></a>
</h1>

<h3 align="center">The JavaScript HTTP RPC API client library for js-ipfs.</h3>

<p align="center">
  <a href="https://riot.im/app/#/room/#ipfs-dev:matrix.org"><img src="https://img.shields.io/badge/matrix-%23ipfs%3Amatrix.org-blue.svg?style=flat" /> </a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat" /></a>
  <a href="https://github.com/ipfs/team-mgmt/blob/master/MGMT_JS_CORE_DEV.md"><img src="https://img.shields.io/badge/team-mgmt-blue.svg?style=flat" /></a>
</p>

<p align="center">
  <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=shield"/></a>
  <a href="https://travis-ci.com/ipfs/js-ipfs"><img src="https://flat.badgen.net/travis/ipfs/js-ipfs" /></a>
  <a href="https://codecov.io/gh/ipfs/js-ipfs-http-client"><img src="https://img.shields.io/codecov/c/github/ipfs/js-ipfs-http-client/master.svg?style=flat-square"></a>
   <a href="https://bundlephobia.com/result?p=ipfs-http-client"><img src="https://flat.badgen.net/bundlephobia/minzip/ipfs-http-client"></a>
  <br>
  <a href="https://david-dm.org/ipfs/js-ipfs?path=packages/ipfs-http-client"><img src="https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square&path=packages/ipfs-http-client" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href="https://github.com/RichardLitt/standard-readme"><img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/ipfs-http-client"><img src="https://img.shields.io/npm/dm/ipfs-http-client.svg" /></a>
  <a href="https://www.jsdelivr.com/package/npm/ipfs-http-client"><img src="https://data.jsdelivr.com/v1/package/npm/ipfs-http-client/badge"/></a>
  <br>
</p>

## Getting Started

We've come a long way, but this project is still in Alpha, lots of development is happening, APIs might change, beware of 🐉..

```bash
npm install --save ipfs-http-client
```

Both the Current and Active LTS versions of Node.js are supported. Please see [nodejs.org](https://nodejs.org/) for what these currently are.

### Next Steps

- Read the [docs](https://github.com/ipfs/js-ipfs/tree/master/docs)
- Look into the [examples](https://github.com/ipfs-examples/js-ipfs-examples) to learn how to spawn an IPFS node in Node.js and in the Browser
- Consult the [Core API docs](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) to see what you can do with an IPFS node
- Visit <https://dweb-primer.ipfs.io> to learn about IPFS and the concepts that underpin it
- Head over to <https://proto.school> to take interactive tutorials that cover core IPFS APIs
- Check out <https://docs.ipfs.io> for tips, how-tos and more
- See <https://blog.ipfs.io> for news and more
- Need help? Please ask 'How do I?' questions on <https://discuss.ipfs.io>

## Usage

#### `create([options])`

> create an instance of the HTTP API client

#### Parameters

None

#### Options

`options` can be a `String`, a `URL` or a `Multiaddr` which will be interpreted as the address of the IPFS node we wish to use the API of.

Alternatively it can be an object which may have the following keys:

| Name     | Type                                                                 | Default                                          | Description                                                                                                    |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| url      | `String` or `URL` or `Multiaddr`                                     | `'http://localhost:5001/api/v0'`                 | A URL that resolves to a running instance of the IPFS [HTTP RPC API](https://docs.ipfs.io/reference/http/api/) |
| protocol | `String`                                                             | `'http'`                                         | The protocol to used (ignored if url is specified)                                                             |
| host     | `String`                                                             | `'localhost'`                                    | The host to used (ignored if url is specified)                                                                 |
| port     | `number`                                                             | `5001`                                           | The port to used (ignored if url is specified)                                                                 |
| path     | `String`                                                             | `'api/v0'`                                       | The path to used (ignored if url is specified)                                                                 |
| agent    | [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) | `http.Agent({ keepAlive: true, maxSockets: 6 })` | An `http.Agent` used to control client behaviour (node.js only)                                                |

#### Returns

| Type     | Description                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------- |
| `Object` | An object that conforms to the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) |

#### Example

```JavaScript
import { create } from 'ipfs-http-client'

// connect to the default API address http://localhost:5001
const client = create()

// connect to a different API
const client = create({ url: "http://127.0.0.1:5002/api/v0" });

// connect using a URL
const client = create(new URL('http://127.0.0.1:5002'))

// call Core API methods
const { cid } = await client.add('Hello world!')
```

### API

[![IPFS Core API Compatible](https://cdn.rawgit.com/ipfs/interface-ipfs-core/master/img/badge.svg)](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core)

> `js-ipfs-http-client` implements the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) - please follow the previous link to see the methods available.

### Additional Options

All core API methods take *additional* `options` specific to the HTTP API:

- `headers` - An object or [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) instance that can be used to set custom HTTP headers. Note that this option can also be [configured globally](#custom-headers) via the constructor options.
- `searchParams` - An object or [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) instance that can be used to add additional query parameters to the query string sent with each request.

### Instance Utils

- `ipfs.getEndpointConfig()`

Call this on your client instance to return an object containing the `host`, `port`, `protocol` and `api-path`.

### Static Types and Utils

Aside from the default export, `ipfs-http-client` exports various types and utilities that are included in the bundle:

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

##### `globSource(path, pattern, [options])`

- `path`: A path to a single file or directory to glob from
- `pattern`: A pattern to match files under `path`
- `options`: Optional options
- `options.hidden`: Hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`.

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

##### Example

```js
import { create, globSource } from 'ipfs'

const ipfs = await create()

for await (const file of ipfs.addAll(globSource('./docs', '**/*'))) {
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
import { create, urlSource } from 'ipfs-http-client'
const ipfs = create()

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

### Running the daemon with the right port

To interact with the API, you need to have a local daemon running. It needs to be open on the right port. `5001` is the default, and is used in the examples below, but it can be set to whatever you need.

```sh
# Show the ipfs config API port to check it is correct
> ipfs config Addresses.API
/ip4/127.0.0.1/tcp/5001
# Set it if it does not match the above output
> ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
# Restart the daemon after changing the config

# Run the daemon
> ipfs daemon
```

### Importing the module and usage

```javascript
import { create } from 'ipfs-http-client'

// connect to ipfs daemon API server
const ipfs = create('http://localhost:5001') // (the default in Node.js)

// or connect with multiaddr
const ipfs = create('/ip4/127.0.0.1/tcp/5001')

// or using options
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' })

// or specifying a specific API path
const ipfs = create({ host: '1.1.1.1', port: '80', apiPath: '/ipfs/api/v0' })
```

### In a web browser

**through Browserify**

Same as in Node.js, you just have to [browserify](http://browserify.org) the code before serving it. See the browserify repo for how to do that.

See the example in the [examples folder](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples) to get a boilerplate.

**through webpack**

See the example in the [examples folder](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples/http-client-bundle-webpack) to get an idea on how to use `js-ipfs-http-client` with webpack.

**from CDN**

Instead of a local installation (and browserification) you may request a remote copy of IPFS API from [jsDelivr](https://www.jsdelivr.com/package/npm/ipfs).

To always request the latest version, use one of the following examples:

```html
<!-- loading the minified version using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ipfs-http-client/dist/index.min.js"></script>
```

For maximum security you may also decide to:

- reference a specific version of IPFS API (to prevent unexpected breaking changes when a newer latest version is published)
- [generate a SRI hash](https://www.srihash.org/) of that version and use it to ensure integrity. Learn more also at the [jsdelivr website](https://www.jsdelivr.com/using-sri-with-dynamic-files)
- set the [CORS settings attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) to make anonymous requests to CDN

Example:

```html
<script
  src="https://www.jsdelivr.com/package/npm/ipfs-http-client"
  integrity="sha384-5bXRcW9kyxxnSMbOoHzraqa7Z0PQWIao+cgeg327zit1hz5LZCEbIMx/LWKPReuB"
  crossorigin="anonymous"
></script>
```

CDN-based IPFS API provides the `IpfsHttpClient` constructor as a method of the global `window` object. Example:

```js
const ipfs = window.IpfsHttpClient({ host: 'localhost', port: 5001 })
```

If you omit the host and port, the client will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```js
const ipfs = window.IpfsHttpClient()
```

### Custom Headers

If you wish to send custom headers with each request made by this library, for example, the Authorization header. You can use the config to do so:

```js
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  headers: {
    authorization: 'Bearer ' + TOKEN
  }
})
```

### Infura Header

If you wish to send infura headers with each request made by this library, for example, the Authorization header. You can use the config to do so:

```js
const auth =
    'Basic ' + Buffer.from(INFURA_ID + ':' + INFURA_SECRET_KEY).toString('base64');
const client = ipfsClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});
```

### Global Timeouts

To set a global timeout for *all* requests pass a value for the `timeout` option:

```js
// Timeout after 10 seconds
const ipfs = create({ timeout: 10000 })
// Timeout after 2 minutes
const ipfs = create({ timeout: '2m' })
// see https://www.npmjs.com/package/parse-duration for valid string values
```

## Development

### Testing

We run tests by executing `npm test` in a terminal window. This will run both Node.js and Browser tests, both in Chrome and PhantomJS. To ensure that the module conforms with the [`interface-ipfs-core`](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core) spec, we run the batch of tests provided by the interface module, which can be found [here](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core/src).

## Historical context

This module started as a direct mapping from the go-ipfs cli to a JavaScript implementation, although this was useful and familiar to a lot of developers that were coming to IPFS for the first time, it also created some confusion on how to operate the core of IPFS and have access to the full capacity of the protocol. After much consideration, we decided to create `interface-ipfs-core` with the goal of standardizing the interface of a core implementation of IPFS, and keep the utility functions the IPFS community learned to use and love, such as reading files from disk and storing them directly to IPFS.

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-ipfs/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

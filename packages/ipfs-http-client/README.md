<h1 align="center">
  <a href="https://ipfs.io"><img width="650px" src="https://ipfs.io/ipfs/QmQJ68PFMDdAsgCZvA1UVzzn18asVcf7HVvCDgpjiSCAse" alt="IPFS http client lib logo" /></a>
</h1>

<h3 align="center">The JavaScript HTTP client library for IPFS implementations.</h3>

<p align="center">
  <a href="http://ipn.io"><img src="https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square" /></a>
  <a href="http://ipfs.io/"><img src="https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square" /></a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square" /></a>
  <a href="https://waffle.io/ipfs/js-ipfs"><img src="https://img.shields.io/badge/pm-waffle-blue.svg?style=flat-square" /></a>
  <a href="https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg?style=flat-square"></a>
</p>

<p align="center">
  <a href="https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_small" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-http-client.svg?type=small"/></a>
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

> A client library for the IPFS HTTP API, implemented in JavaScript. This client library implements the IPFS [Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/api) enabling applications to change between an embedded js-ipfs node and any remote IPFS node without having to change the code. In addition, this client library implements a set of utility functions.

## Lead Maintainer

[Alex Potsides](http://github.com/achingbrain)

## Table of Contents

- [Lead Maintainer](#lead-maintainer)
- [Table of Contents](#table-of-contents)
- [Install](#install)
  - [Running the daemon with the right port](#running-the-daemon-with-the-right-port)
  - [Importing the module and usage](#importing-the-module-and-usage)
  - [Importing a sub-module and usage](#importing-a-sub-module-and-usage)
  - [In a web browser](#in-a-web-browser)
  - [CORS](#cors)
  - [Custom Headers](#custom-headers)
  - [Global Timeouts](#global-timeouts)
- [Usage](#usage)
  - [API](#api)
- [Development](#development)
  - [Testing](#testing)
- [Contribute](#contribute)
- [Historical context](#historical-context)
- [License](#license)

## Install

This module uses node.js, and can be installed through npm:

```bash
npm install --save ipfs-http-client
```

We support both the Current and Active LTS versions of Node.js. Please see [nodejs.org](https://nodejs.org/) for what these currently are.

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
const ipfsClient = require('ipfs-http-client')

// connect to ipfs daemon API server
const ipfs = ipfsClient('http://localhost:5001') // (the default in Node.js)

// or connect with multiaddr
const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

// or using options
const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' })

// or specifying a specific API path
const ipfs = ipfsClient({ host: '1.1.1.1', port: '80', apiPath: '/ipfs/api/v0' })
```

### Importing a sub-module and usage

```javascript
const bitswap = require('ipfs-http-client/src/bitswap')('/ip4/127.0.0.1/tcp/5001')

const list = await bitswap.wantlist(key)
// ...
```

### In a web browser

**through Browserify**

Same as in Node.js, you just have to [browserify](http://browserify.org) the code before serving it. See the browserify repo for how to do that.

See the example in the [examples folder](/examples/browser-browserify) to get a boilerplate.

**through webpack**

See the example in the [examples folder](examples/bundle-webpack) to get an idea on how to use `js-ipfs-http-client` with webpack.

**from CDN**

Instead of a local installation (and browserification) you may request a remote copy of IPFS API from [jsDelivr](https://www.jsdelivr.com/package/npm/ipfs).

To always request the latest version, use one of the following examples:

```html
<!-- loading the minified version using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ipfs-http-client/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ipfs-http-client/dist/index.js"></script>
```

For maximum security you may also decide to:

* reference a specific version of IPFS API (to prevent unexpected breaking changes when a newer latest version is published)
* [generate a SRI hash](https://www.srihash.org/) of that version and use it to ensure integrity. Learn more also at the [jsdelivr website](https://www.jsdelivr.com/using-sri-with-dynamic-files)
* set the [CORS settings attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) to make anonymous requests to CDN

Example:

```html
<script src="https://www.jsdelivr.com/package/npm/ipfs-http-client"
integrity="sha384-5bXRcW9kyxxnSMbOoHzraqa7Z0PQWIao+cgeg327zit1hz5LZCEbIMx/LWKPReuB"
crossorigin="anonymous"></script>
```

CDN-based IPFS API provides the `IpfsHttpClient` constructor as a method of the global `window` object. Example:

```js
const ipfs = window.IpfsHttpClient({ host: 'localhost', port: 5001 })
```

If you omit the host and port, the client will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```js
const ipfs = window.IpfsHttpClient()
```

### CORS

In a web browser IPFS HTTP client (either browserified or CDN-based) might encounter an error saying that the origin is not allowed. This would be a CORS ("Cross Origin Resource Sharing") failure: IPFS servers are designed to reject requests from unknown domains by default. You can whitelist the domain that you are calling from by changing your ipfs config like this:

```console
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://example.com"]'
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```

### Custom Headers

If you wish to send custom headers with each request made by this library, for example, the Authorization header. You can use the config to do so:

```js
const ipfs = ipfsClient({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  headers: {
    authorization: 'Bearer ' + TOKEN
  }
})
```

### Global Timeouts

To set a global timeout for _all_ requests pass a value for the `timeout` option:

```js
// Timeout after 10 seconds
const ipfs = ipfsClient({ timeout: 10000 })
// Timeout after 2 minutes
const ipfs = ipfsClient({ timeout: '2m' })
// see https://www.npmjs.com/package/parse-duration for valid string values
```

## Usage

### API

[![IPFS Core API Compatible](https://cdn.rawgit.com/ipfs/interface-ipfs-core/master/img/badge.svg)](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core)

> `js-ipfs-http-client` follows the spec defined by [`interface-ipfs-core`](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core), which concerns the interface to expect from IPFS implementations. This interface is a currently active endeavor. You can use it today to consult the methods available.

## Development

### Testing

We run tests by executing `npm test` in a terminal window. This will run both Node.js and Browser tests, both in Chrome and PhantomJS. To ensure that the module conforms with the [`interface-ipfs-core`](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core) spec, we run the batch of tests provided by the interface module, which can be found [here](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core/src).

## Contribute

The js-ipfs-http-client is a work in progress. As such, there's a few things you can do right now to help out:

- **[Check out the existing issues](https://github.com/ipfs/js-ipfs-http-client/issues)**!
- **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
- **Add tests**. There can never be enough tests. Note that interface tests exist inside [`interface-ipfs-core`](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core/src).

**Want to hack on IPFS?**

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## Historical context

This module started as a direct mapping from the go-ipfs cli to a JavaScript implementation, although this was useful and familiar to a lot of developers that were coming to IPFS for the first time, it also created some confusion on how to operate the core of IPFS and have access to the full capacity of the protocol. After much consideration, we decided to create `interface-ipfs-core` with the goal of standardizing the interface of a core implementation of IPFS, and keep the utility functions the IPFS community learned to use and love, such as reading files from disk and storing them directly to IPFS.

## License

[MIT](LICENSE)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-http-client.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fipfs%2Fjs-ipfs-http-client?ref=badge_large)

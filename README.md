IPFS API wrapper library in JavaScript
======================================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) [![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-api/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-api?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-api.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-api)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs-api.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-api)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-api.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-api)

> A client library for the IPFS API.

# Usage

## Installing the module

### In Node.js Through npm

```bash
$ npm install --save ipfs-api
```
**Note:** ipfs-api requires Node v4.x (LTS) or higher.

#### Running the daemon with the right port

To interact with the API, you need to have a local daemon running. It needs to be open on the right port. `5001` is the default, and is used in the examples below, but it can be set to whatever you need.

```sh
# Show the ipfs config API port to check it is correct
$ ipfs config Addresses.API
/ip4/127.0.0.1/tcp/5001
# Set it if it does not match the above output
$ ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
# Restart the daemon after changing the config

# Run the daemon
$ ipfs daemon
```

#### Importing the module and usage

```javascript
var ipfsAPI = require('ipfs-api')

// connect to ipfs daemon API server
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'}) // leaving out the arguments will default to these values

// or connect with multiaddr
var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

// or using options
var ipfs = ipfsAPI({host: 'localhost', port: '5001', procotol: 'http'})
```

### In the Browser through browserify

Same as in Node.js, you just have to [browserify](http://browserify.org) the code before serving it. See the browserify repo for how to do that.

### In the Browser through `<script>` tag

You can use [npmcdn](https://npmcdn.com/) to get the latest built version, like this

```html
<script src="https://npmcdn.com/ipfs-api/dist/index.js"></script>
```

This will export the `IpfsApi` constructor on the `window` object, such that:

```
var ipfs = window.IpfsApi('localhost', '5001')
```

If you omit the host and port, the api will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```
var ipfs = window.IpfsApi()
```

## CORS

If are using this module in a browser with something like browserify, then you will get an error saying that the origin is not allowed. This would be a CORS ("Cross Origin Resource Sharing") failure. The ipfs server rejects requests from unknown domains by default. You can whitelist the domain that you are calling from by changing your ipfs config like this:

```bash
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://example.com\"]"
```

## Usage

See [API.md](API.md) and [`tests/api`](test/api) for details on available methods.

### Callbacks and promises

If you do not pass in a callback all API functions will return a `Promise`. For example:

```js
ipfs.id()
  .then(function (id) {
    console.log('my id is: ', id)
  })
  .catch(function(err) {
  	console.log('Fail: ', err)
  })
```

This relies on a global `Promise` object. If you are in an environment where that is not
yet available you need to bring your own polyfill.

## Contribute

The js-ipfs API is a work in progress. As such, there's a few things you can do right now to help out:

* **[Check out the existing issues](https://github.com/ipfs/js-ipfs-api/issues)**!
* **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
* **Add tests**. There can never be enough tests.
* **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

## License

MIT.

# Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

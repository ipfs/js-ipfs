IPFS API wrapper library in JavaScript
======================================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
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

Make the [ipfsapi.min.js](https://github.com/ipfs/js-ipfs-api/blob/master/dist/ipfsapi.min.js) available through your server and load it using a normal `<script>` tag, this will export the `ipfsAPI` constructor on the `window` object, such that:

```
var ipfs = window.ipfsAPI('localhost', '5001')
```

If you omit the host and port, the api will parse `window.host`, and use this information. This also works, and can be useful if you want to write apps that can be run from multiple different gateways:

```
var ipfs = window.ipfsAPI()
```

### Using Promises

If you do not pass in a callback all api functions will return a `Promise`, for example

```js
ipfs.id()
  .then(function (id) {
    console.log('my id is: ', id)
  })
```

This relies on a global `Promise` object. If you are in an environemnt where that is not
yet available you need to bring your own polyfill.

#### Gotchas

When using the api from script tag for things that require buffers (`ipfs.add`, for example), you will have to use either the exposed `ipfs.Buffer`, that works just like a node buffer, or use this [browser buffer](https://github.com/feross/buffer).

## CORS

If are using this module in a browser with something like browserify, then you will get an error saying that the origin is not allowed. This would be a CORS ("Cross Origin Resource Sharing") failure. The ipfs server rejects requests from unknown domains by default. You can whitelist the domain that you are calling from by changing your ipfs config like this:

```bash
$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://example.com\"]"
```

## Usage

We classify the API calls by 'core', 'extensions', 'tooling', and 'network', following the same API spec organization available at [ipfs/specs](https://github.com/ipfs/specs/blob/ipfs/api/api/core/README.md)

The tests folder also contains great examples that can be used to understand how this client library interacts with the HTTP-API. You can find the tests here: https://github.com/ipfs/js-ipfs-api/tree/master/test/api

### Core

##### version

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/version.spec.js)

##### node

> node start and stop are not implemented in the API

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/id.spec.js)

##### block

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/block.spec.js)

##### object

*curl*
```sh
curl 'http://localhost:5001/api/v0/object/get?arg=QmYEqnfCZp7a39Gxrgyv3qRS4MoCTGjegKV6zroU3Rvr52&stream-channels=true' --compressed
```

*response*
```js
{
    Links: [{
        Name: string,
        Hash: string,
        Size: number
    }, ...],
    Data: string
}
```
*Data is base64 encoded.*

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/object.spec.js)

##### pin


-------------------------------------------------------

### Extensions


-------------------------------------------------------

### Tooling

##### add

Add a file (where file is any data) to ipfs returning the hash and name. The
name value will only be set if you are actually sending a file. A single or
array of files can be used.

*usage*
```javascript
ipfs.add(files, function(err, res) {
    if(err || !res) return console.error(err)

    res.forEach(function(file) {
        console.log(file.Hash)
        console.log(file.Name)
    })
})
```

`files` can be a mixed array of filenames or buffers of data. A single value is
also acceptable.

Example
```js
var files = ["../files/hello.txt", new Buffer("ipfs!")]
var files = "../files/hello.txt"
```

*curl*
```sh
curl 'http://localhost:5001/api/v0/add?stream-channels=true' \
-H 'content-type: multipart/form-data; boundary=a831rwxi1a3gzaorw1w2z49dlsor' \
-H 'Connection: keep-alive' \
--data-binary $'--a831rwxi1a3gzaorw1w2z49dlsor\r\nContent-Type: application/octet-stream\r\nContent-Disposition: file; name="file"; filename="Hello.txt"\r\n\r\nhello--a831rwxi1a3gzaorw1w2z49dlsor--' --compressed
```

*response*
```js
[{
    Hash: string,
    Name: string
}, ...]
```
*The name value will only be set for actual files.*

##### cat

Retrieve the contents of a single hash, or array of hashes.

**usage**

```javascript
ipfs.cat(hashs, function(err, res) {
    if(err || !res) return console.error(err)

    if(res.readable) {
        // Returned as a stream
        res.pipe(process.stdout)
    } else {
        // Returned as a string
        console.log(res)
    }
})
```

*curl*

```sh
curl "http://localhost:5001/api/v0/cat?arg=<hash>&stream-channels=true"
```

*response*

The response is either a readable stream, or a string.

##### ls
Get the node structure of a hash. Included in it is a hash and array to links.

*Usage*
```javascript
ipfs.ls(hashs, function(err, res) {
    if(err || !res) return console.error(err)

    res.Objects.forEach(function(node) {
        console.log(node.Hash)
        console.log("Links [%d]", node.Links.length)
        node.Links.forEach(function(link, i) {
            console.log("[%d]", i, link)
        })
    })
})
```

*Curl*
```sh
curl "http://localhost:5001/api/v0/ls?arg=<hash>&stream-channels=true"
```

*Response*
```js
{
    Objects: [
        {
            Hash: string,
            Links: [{
                Name: string,
                Hash: string,
                Size: number
            }, ...]
        },
        ....
    ]
}
```

##### update

-------------------------------------------------------

### Network



-------------------------------------------------------

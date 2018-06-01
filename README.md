# js-ipfs-http-response

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Creates an HTTP response from an IPFS Hash

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

### Installation

> npm install ipfs-http-response

## Usage

This project consists on creating a HTTP response from an IPFS Hash. This response can be a file, a directory list view or the entry point of a web page.

```js
const { getResponse } = require('ipfs-http-response')

getResponse(ipfsNode, ipfsPath)
  .then((result) => {
    ...
  })
```

This module also exports the used ipfs resolver, which should be used when the response needs to be customized.

```js
const { resolver } = require('ipfs-http-response')

resolver.multihash(ipfsNode, ipfsPath)
  .then((result) => {
    ...
  })
```

```js
const { resolver } = require('ipfs-http-response')

resolver.directory(node, path, multihash)
  .then((result) => {
    ...
  })
```

![ipfs-http-response usage](docs/ipfs-http-response.png "ipfs-http-response usage")

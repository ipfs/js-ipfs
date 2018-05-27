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
const ipfsHttpResponse = require('ipfs-http-response')

ipfsHttpResponse(ipfsNode, ipfsPath)
  .then((response) => {
    ...
  })
```

![ipfs-http-response usage](docs/ipfs-http-response.png "ipfs-http-response usage")

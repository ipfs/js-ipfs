# js-ipfs-http-response

> Creates an HTTP response from an IPFS Hash

### Installation

> TODO

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

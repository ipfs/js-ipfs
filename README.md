ipfs-multipart
====

[![build status](https://travis-ci.org/xicombd/ipfs-multipart.svg)](http://travis-ci.org/xicombd/ipfs-multipart)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A set of utilities to help dealing with [IPFS](https://ipfs.io/) multipart.


## Install
```
npm i --save ipfs-multipart
```

## Usage
```javascript
const http = require('http')
const IPFSMultipart = require('ipfs-multipart')

http.createServer((req, res) => {
  if (req.method === 'POST' && req.headers['content-type']) {
    const parser = IPFSMultipart.reqParser(req)

    parser.on('file', (fileName, fileStream) => {
      console.log(`file ${fileName} start`)

      fileStream.on('data', (data) => {
        console.log(`file ${fileName} contents:`, data.toString())
      })

      fileStream.on('end', (data) => {
        console.log(`file ${fileName} end`)
      })
    })

    parser.on('end', () => {
      console.log('finished parsing')
      res.writeHead(200)
      res.end()
    })

    return
  }

  res.writeHead(404)
  res.end()
}).listen(5001, () => {
  console.log('server listening on port 5001')
})
```

## License

MIT

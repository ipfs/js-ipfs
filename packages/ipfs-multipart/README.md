ipfs-multipart
====

[![made by Protocol Labs](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![Project IPFS](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![freenode #ipfs](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Codecov branch](https://img.shields.io/codecov/c/github/ipfs/js-ipfs-multipart/master.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-multipart)
[![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-multipart)](https://travis-ci.com/ipfs/js-ipfs-multipart)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-multipart.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-multipart)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)




> A set of utilities to help dealing with [IPFS](https://ipfs.io/) multipart.

## Lead Maintainer

[Hugo Dias](https://github.com/hugomrdias)

### Notice 
> This module is moving to async iterators starting from 0.2.0.   
> The last minor version to support event emitter is 0.1.1, any backports will merged to the branch `event-emitter` and released under  `>0.1.0 <0.2.0`.

## Install
```
npm install ipfs-multipart
```

## Usage
```javascript
const http = require('http')
const parser = require('ipfs-multipart')

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.headers['content-type']) {

    for await (const entry of parser(req)) {
      if (entry.type === 'directory') {
        console.log(`dir ${entry.name} start`)
      }

      if (entry.type === 'file') {
        console.log(`file ${entry.name} start`)

        for await (const data of entry.content) {
          console.log(`file ${entry.name} contents:`, data.toString())
        }

        console.log(`file ${entry.name} end`)
      }
    }

    console.log('finished parsing')
    res.writeHead(200)
    res.end()
  }

  res.writeHead(404)
  res.end()
}).listen(5001, () => {
  console.log('server listening on port 5001')
})
```

## Contribute

See [the contribute file](https://github.com/ipfs/community/blob/master/contributing.md) and our [code of conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md)!

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) © Protocol Labs Inc.
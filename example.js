'use strict'

/* eslint-disable no-console */

const http = require('http')
const multipart = require('ipfs-multipart')

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.headers['content-type']) {
    for await (const part of multipart(req)) {
      console.log(`file ${part.name} start`)

      if (part.type === 'file') {
        for await (const chunk of part.content) {
          console.log(`file ${part.name} contents:`, chunk.toString())
        }
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

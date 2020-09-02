/* eslint-env mocha */
'use strict'

const { isNode } = require('ipfs-utils/src/env')
const { expect } = require('aegir/utils/chai')
const ipfsClient = require('../../src')
const uint8ArrayFromString = require('uint8arrays/from-string')

function startServer (fn) {
  let headersResolve
  const headers = new Promise((resolve) => {
    headersResolve = resolve
  })

  // spin up a test http server to inspect the requests made by the library
  const server = require('http').createServer((req, res) => {
    req.on('data', () => {})
    req.on('end', () => {
      res.writeHead(200)
      res.write(JSON.stringify({}))
      res.end()
      server.close()

      headersResolve(req.headers)
    })
  })

  server.listen(6001, () => {
    fn().then(() => {}, () => {})
  })

  return headers
}

describe('custom headers', function () {
  // do not test in browser
  if (!isNode) {
    return
  }

  let ipfs

  describe('supported in the constructor', () => {
    // initialize ipfs with custom headers
    before(() => {
      ipfs = ipfsClient({
        host: 'localhost',
        port: 6001,
        protocol: 'http',
        headers: {
          authorization: 'Bearer YOLO'
        }
      })
    })

    it('regular API calls', async () => {
      const headers = await startServer(() => ipfs.id())

      expect(headers.authorization).to.equal('Bearer YOLO')
    })

    it('multipart API calls', async () => {
      const headers = await startServer(() => ipfs.files.write('/foo/bar', uint8ArrayFromString('derp'), {
        create: true
      }))

      expect(headers.authorization).to.equal('Bearer YOLO')
    })
  })

  describe('supported as API call arguemnts', () => {
    // initialize ipfs with custom headers
    before(() => {
      ipfs = ipfsClient({
        host: 'localhost',
        port: 6001,
        protocol: 'http'
      })
    })

    it('regular API calls', async () => {
      const headers = await startServer(() => ipfs.id({
        headers: {
          authorization: 'Bearer OLOY'
        }
      }))

      expect(headers.authorization).to.equal('Bearer OLOY')
    })

    it('multipart API calls', async () => {
      const headers = await startServer(() => ipfs.files.write('/foo/bar', uint8ArrayFromString('derp'), {
        create: true,
        headers: {
          authorization: 'Bearer OLOY'
        }
      }))

      expect(headers.authorization).to.equal('Bearer OLOY')
    })
  })
})

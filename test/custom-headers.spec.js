/* eslint-env mocha */
'use strict'

const isNode = require('detect-node')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const ipfsClient = require('../src')

describe('custom headers', function () {
  // do not test in browser
  if (!isNode) { return }
  let ipfs
  // initialize ipfs with custom headers
  before(() => {
    ipfs = ipfsClient({
      host: 'localhost',
      port: 6001,
      protocol: 'http',
      headers: {
        authorization: 'Bearer ' + 'YOLO'
      }
    })
  })

  it('are supported', (done) => {
    // spin up a test http server to inspect the requests made by the library
    const server = require('http').createServer((req, res) => {
      req.on('data', () => {})
      req.on('end', () => {
        res.writeHead(200)
        res.write(JSON.stringify({}))
        res.end()
        // ensure custom headers are present
        expect(req.headers.authorization).to.equal('Bearer ' + 'YOLO')
        server.close()
        done()
      })
    })

    server.listen(6001, () => {
      ipfs.id((err, res) => {
        if (err) {
          throw err
        }
        // this call is used to test that headers are being sent.
      })
    })
  })
})

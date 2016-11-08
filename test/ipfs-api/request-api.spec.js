/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const ipfsAPI = require('./../../src/index.js')

describe('ipfsAPI request tests', () => {
  it('does not crash if no content-type header is provided', (done) => {
    if (!isNode) {
      return done()
    }

    // go-ipfs always (currently) adds a content-type header, even if no content is present,
    // the standard behaviour for an http-api is to omit this header if no content is present
    const server = require('http').createServer((req, res) => {
      res.writeHead(200)
      res.end()
    }).listen(6001, () => {
      ipfsAPI('/ip4/127.0.0.1/tcp/6001')
        .config.replace('test/fixtures/r-config.json', (err) => {
          expect(err).to.not.exist
          server.close(done)
        })
    })
  })
})

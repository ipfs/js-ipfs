/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const ipfsAPI = require('../src/index.js')
const ndjson = require('ndjson')
const pump = require('pump')

describe('\'deal with HTTP weirdness\' tests', () => {
  it('does not crash if no content-type header is provided', (done) => {
    if (!isNode) {
      return done()
    }

    // go-ipfs always (currently) adds a content-type header, even if no content is present,
    // the standard behaviour for an http-api is to omit this header if no content is present
    const server = require('http').createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        res.writeHead(200)
        res.end()
      })
    })

    server.listen(6001, () => {
      ipfsAPI('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json', (err) => {
        expect(err).to.not.exist()
        server.close(done)
      })
    })
  })
})

describe('trailer headers', () => {
  // TODO: needs fixing https://github.com/ipfs/js-ipfs-api/pull/624#issuecomment-344181950
  it.skip('should deal with trailer x-stream-error correctly', (done) => {
    if (!isNode) { return done() }

    const server = require('http').createServer((req, res) => {
      const resStream = pump(res, ndjson.stringify())
      res.setHeader('x-chunked-output', '1')
      res.setHeader('content-type', 'application/json')
      res.setHeader('Trailer', 'X-Stream-Error')
      res.addTrailers({ 'X-Stream-Error': JSON.stringify({ Message: 'ups, something went wrong', Code: 500 }) })
      resStream.write({ Bytes: 1 })
      res.end()
    })

    server.listen(6001, () => {
      const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/6001')
      /* eslint-disable */
      ipfs.files.add(Buffer.from('Hello there!'), (err, res) => {
        // TODO: error's are not being correctly
        // propagated with Trailer headers yet
        // expect(err).to.exist()
        expect(res).to.not.equal(0)
        server.close(done)
      })
      /* eslint-enable */
    })
  })
})

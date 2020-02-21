/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { isNode } = require('ipfs-utils/src/env')
const ipfsClient = require('../src/index.js')

describe('\'deal with HTTP weirdness\' tests', () => {
  it('does not crash if no content-type header is provided', async function () {
    if (!isNode) return this.skip()

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

    await new Promise(resolve => server.listen(6001, resolve))
    await ipfsClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json')

    server.close()
  })
})

describe('trailer headers', () => {
  // TODO: needs fixing https://github.com/ipfs/js-ipfs-http-client/pull/624#issuecomment-344181950
  it.skip('should deal with trailer x-stream-error correctly', (done) => {
    if (!isNode) { return done() }

    const server = require('http').createServer((req, res) => {
      res.setHeader('x-chunked-output', '1')
      res.setHeader('content-type', 'application/json')
      res.setHeader('Trailer', 'X-Stream-Error')
      res.addTrailers({ 'X-Stream-Error': JSON.stringify({ Message: 'ups, something went wrong', Code: 500 }) })
      res.write(JSON.stringify({ Bytes: 1 }))
      res.end()
    })

    server.listen(6001, () => {
      const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/6001')
      /* eslint-disable */
      ipfs.add(Buffer.from('Hello there!'), (err, res) => {
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

describe('error handling', () => {
  it('should handle plain text error response', async function () {
    if (!isNode) return this.skip()

    const server = require('http').createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        // Write a text/plain response with a 403 (forbidden) status
        res.writeHead(403, { 'Content-Type': 'text/plain' })
        res.write('ipfs method not allowed')
        res.end()
      })
    })

    await new Promise(resolve => server.listen(6001, resolve))

    await expect(ipfsClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejectedWith('ipfs method not allowed')
      .and.to.have.nested.property('response.status').that.equals(403)

    server.close()
  })

  it('should handle JSON error response', async function () {
    if (!isNode) return this.skip()

    const server = require('http').createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        // Write a application/json response with a 400 (bad request) header
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({ Message: 'client error', Code: 1 }))
        res.end()
      })
    })

    await new Promise(resolve => server.listen(6001, resolve))

    await expect(ipfsClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejectedWith('client error')
      .and.to.have.nested.property('response.status').that.equals(400)

    server.close()
  })

  it('should handle JSON error response with invalid JSON', async function () {
    if (!isNode) return this.skip()

    const server = require('http').createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        // Write a application/json response with a 400 (bad request) header
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.write('{ Message: ')
        res.end()
      })
    })

    await new Promise(resolve => server.listen(6001, resolve))

    await expect(ipfsClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejected()
      .and.to.have.property('message').that.includes('Unexpected token M in JSON at position 2')

    server.close()
  })
})

/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { create as httpClient } from '../../src/index.js'
import http from 'http'

describe('\'deal with HTTP weirdness\' tests', () => {
  let server

  afterEach(async () => {
    if (server != null) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err)
            return
          }

          resolve()
        })
      })
    }
  })

  it('does not crash if no content-type header is provided', async function () {
    // go-ipfs always (currently) adds a content-type header, even if no content is present,
    // the standard behaviour for an http-api is to omit this header if no content is present
    server = http.createServer((req, res) => {
      // Consume the entire request, before responding.
      req.on('data', () => {})
      req.on('end', () => {
        res.writeHead(200)
        res.end()
      })
    })

    await new Promise(resolve => server.listen(6001, resolve))
    await httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json')
  })
})

describe('trailer headers', () => {
  let server

  afterEach(async () => {
    if (server != null) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err)
            return
          }

          resolve()
        })
      })
    }
  })

  // TODO: needs fixing https://github.com/ipfs/js-ipfs-http-client/pull/624#issuecomment-344181950
  it.skip('should deal with trailer x-stream-error correctly', async () => {
    server = http.createServer((req, res) => {
      res.setHeader('x-chunked-output', '1')
      res.setHeader('content-type', 'application/json')
      res.setHeader('Trailer', 'X-Stream-Error')
      res.addTrailers({ 'X-Stream-Error': JSON.stringify({ Message: 'ups, something went wrong', Code: 500 }) })
      res.write(JSON.stringify({ Bytes: 1 }))
      res.end()
    })

    await new Promise(resolve => server.listen(6001, resolve))

    // TODO: errors are not being correctly propagated with Trailer headers yet
    // const ipfs = httpClient('/ip4/127.0.0.1/tcp/6001')
    // await expect(ipfs.add(uint8ArrayFromString('Hello there!'))).to.eventually.be.rejected()
  })
})

describe('error handling', () => {
  let server

  afterEach(async () => {
    if (server != null) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err)
            return
          }

          resolve()
        })
      })
    }
  })

  it('should handle plain text error response', async function () {
    server = http.createServer((req, res) => {
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

    await expect(httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejectedWith('ipfs method not allowed')
      .and.to.have.nested.property('response.status').that.equals(403)
  })

  it('should handle JSON error response', async function () {
    server = http.createServer((req, res) => {
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

    await expect(httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejectedWith('client error')
      .and.to.have.nested.property('response.status').that.equals(400)
  })

  it('should handle JSON error response with invalid JSON', async function () {
    server = http.createServer((req, res) => {
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

    await expect(httpClient('/ip4/127.0.0.1/tcp/6001').config.replace('test/fixtures/r-config.json'))
      .to.eventually.be.rejected()
      .and.to.have.property('message').that.includes('Unexpected token M in JSON at position 2')
  })
})

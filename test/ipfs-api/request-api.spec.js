/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const ipfsAPI = require('./../../src/index.js')
const noop = () => {}

describe('ipfsAPI request tests', () => {
  describe('requestAPI', () => {
    const apiAddrs = require('./../setup/tmp-disposable-nodes-addrs.json')
    const apiAddr = apiAddrs.a.split('/')

    it('excludes port from URL if config.port is falsy', (done) => {
      const Wreck = require('wreck')
      const request = Wreck.request

      Wreck.request = (method, uri, opts, cb) => {
        Wreck.request = request
        expect(uri).to.not.contain(/:\d/)
        done()
      }

      ipfsAPI({
        host: apiAddr[2],
        port: null,
        protocol: 'http'
      }).id(noop)
    })

    it('includes port in URL if config.port is truthy', (done) => {
      const Wreck = require('wreck')
      const request = Wreck.request

      Wreck.request = (method, uri, opts, cb) => {
        Wreck.request = request
        expect(uri).to.contain(':' + apiAddr[4])
        done()
      }

      ipfsAPI({
        host: apiAddr[2],
        port: apiAddr[4],
        protocol: 'http'
      }).id(noop)
    })

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
})

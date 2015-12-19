'use strict'

const ipfsAPI = require('../src/index.js')
const noop = () => {}

describe('ipfsAPI request tests', () => {
  describe('requestAPI', () => {
    const apiAddrs = require('./tmp-disposable-nodes-addrs.json')
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
  })
})

/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe.skip('/bitswap', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    it('/wantlist', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/wantlist'
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.have.property('Keys')
        // TODO test that there actual values in there
        done()
      })
    })

    it('/stat', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/stat'
      }, (res) => {
        expect(res.statusCode).to.equal(200)

        expect(res.result).to.have.keys([
          'BlocksReceived',
          'Wantlist',
          'Peers',
          'DupBlksReceived',
          'DupDataReceived'
        ])
        // TODO test that there actual values in there
        done()
      })
    })

    it.skip('/unwant', () => {
    })
  })
}

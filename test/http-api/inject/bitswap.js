/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/bitswap', () => {
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
        done()
      })
    })

    it('/stat', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/stat'
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.have.property('ProvideBufLen')
        expect(res.result).to.have.property('BlocksReceived')
        expect(res.result).to.have.property('Wantlist')
        expect(res.result).to.have.property('Peers')
        expect(res.result).to.have.property('DupBlksReceived')
        expect(res.result).to.have.property('DupDataReceived')
        expect(res.result).to.have.property('DataReceived')
        expect(res.result).to.have.property('BlocksSent')
        expect(res.result).to.have.property('DataSent')
        done()
      })
    })
  })
}

/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/dns', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    it('get the id', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/dns?arg=ipfs.io'
      }, (res) => {
        expect(res).to.have.property('Path')
        done()
      })
    })
  })
}

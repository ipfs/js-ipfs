/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/dns', () => {
    let api

    before(() => {
      api = http.api._apiServer
    })

    it('resolve ipfs.io dns', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/dns?arg=ipfs.io'
      })

      expect(res.result).to.have.property('Path')
    })
  })
}

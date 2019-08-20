/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/dns', () => {
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    it('resolve ipfs.io DNS', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/dns?arg=ipfs.io'
      })

      expect(res.result).to.have.property('Path')
    })

    it('resolve ipfs.enstest.eth ENS', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/dns?arg=ipfs.enstest.eth'
      })

      expect(res.result).to.have.property('Path')
    })
  })
}

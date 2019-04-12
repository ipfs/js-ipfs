/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pkgversion = require('./../../../package.json').version

module.exports = (http) => {
  describe('/version', () => {
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    it('get the version', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/version'
      })

      expect(res.result).to.have.a.property('Version', pkgversion)
      expect(res.result).to.have.a.property('Commit')
      expect(res.result).to.have.a.property('Repo')
    })
  })
}

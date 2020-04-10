/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const pkgversion = require('./../../../package.json').version
const testHttpMethod = require('../../utils/test-http-method')

module.exports = (http) => {
  describe('/version', () => {
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/version')
    })

    it('get the version', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/api/v0/version'
      })

      expect(res.result).to.have.a.property('Version', pkgversion)
      expect(res.result).to.have.a.property('Commit')
      expect(res.result).to.have.a.property('Repo')
    })
  })
}

/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pkgversion = require('./../../../package.json').version

module.exports = (http) => {
  describe('/version', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    it('get the version', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/version'
      }, (res) => {
        expect(res.result).to.have.a.property('Version', pkgversion)
        expect(res.result).to.have.a.property('Commit')
        expect(res.result).to.have.a.property('Repo')
        done()
      })
    })
  })
}

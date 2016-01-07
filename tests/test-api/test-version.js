/* globals describe, it */

var expect = require('chai').expect

process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
var api = require('../../src/http-api')

describe('api: version', function () {
  it('get the version', function (done) {
    api.start(err => {
      expect(err).to.not.exist
      api.server.inject({
        method: 'GET',
        url: '/api/v0/version'
      }, res => {
        expect(res.result).to.equal('0.4.0-dev')
        done()
      })
    })
  })
})

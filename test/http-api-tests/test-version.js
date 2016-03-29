/* eslint-env mocha */

const expect = require('chai').expect
const APIctl = require('ipfs-api')

describe('version', () => {
  describe('api', () => {
    var api

    it('api', (done) => {
      api = require('../../src/http-api').server.select('API')
      done()
    })

    it('get the version', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/version'
      }, (res) => {
        expect(res.result.Version).to.equal('0.4.0-dev')
        expect(res.result).to.have.a.property('Commit')
        expect(res.result).to.have.a.property('Repo')
        done()
      })
    })
  })

  describe('gateway', () => {})

  describe('using js-ipfs-api', () => {
    var ctl

    it('start IPFS API ctl', (done) => {
      ctl = APIctl('/ip4/127.0.0.1/tcp/6001')
      done()
    })

    it('get the version', (done) => {
      ctl.version((err, result) => {
        expect(err).to.not.exist
        expect(result).to.have.a.property('Version')
        expect(result).to.have.a.property('Commit')
        expect(result).to.have.a.property('Repo')
        done()
      })
    })
  })
})

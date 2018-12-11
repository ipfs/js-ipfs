/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (http) => {
  describe('/ping', function () {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    it('returns 400 if both n and count are provided', (done) => {
      api.inject({
        method: 'GET',
        url: `/api/v0/ping?arg=peerid&n=1&count=1`
      }, (res) => {
        expect(res.statusCode).to.equal(400)
        done()
      })
    })

    it('returns 400 if arg is not provided', (done) => {
      api.inject({
        method: 'GET',
        url: `/api/v0/ping?count=1`
      }, (res) => {
        expect(res.statusCode).to.equal(400)
        done()
      })
    })

    it('returns 500 for incorrect Peer Id', function (done) {
      this.timeout(90 * 1000)

      api.inject({
        method: 'GET',
        url: `/api/v0/ping?arg=peerid`
      }, (res) => {
        expect(res.statusCode).to.equal(500)
        done()
      })
    })
  })
}

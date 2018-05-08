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
        url: `/api/v0/ping?arg=someRandomId&n=1&count=1`
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

    it('returns 200 and the response stream with the ping result', (done) => {
      api.inject({
        method: 'GET',
        url: `/api/v0/ping?arg=someRandomId`
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.headers['x-chunked-output']).to.equal('1')
        expect(res.headers['transfer-encoding']).to.equal('chunked')
        expect(res.headers['content-type']).to.include('application/json')
        done()
      })
    })
  })
}

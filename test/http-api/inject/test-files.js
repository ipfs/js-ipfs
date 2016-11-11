/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/files', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    describe('/add', () => {}) // TODO

    describe('/cat', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/cat'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/cat?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('valid hash', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/cat?arg=QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.rawPayload).to.deep.equal(new Buffer('hello world' + '\n'))
          expect(res.payload).to.equal('hello world' + '\n')
          done()
        })
      })
    })

    describe('/get', () => {}) // TODO

    describe('/ls', () => {}) // TODO
  })
}

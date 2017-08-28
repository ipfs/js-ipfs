/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/files', () => {
    let gateway

    before(() => {
      gateway = http.api.server.select('Gateway')
    })

    describe('/ipfs', () => {
      it('returns 400 for request without argument', (done) => {
        gateway.inject({
          method: 'GET',
          url: '/ipfs'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('400 for request with invalid argument', (done) => {
        gateway.inject({
          method: 'GET',
          url: '/ipfs/invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('valid hash', (done) => {
        gateway.inject({
          method: 'GET',
          url: '/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.rawPayload).to.deep.equal(new Buffer('hello world' + '\n'))
          expect(res.payload).to.equal('hello world' + '\n')
          done()
        })
      })
    })
  })
}

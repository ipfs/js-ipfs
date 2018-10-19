/* eslint-env mocha */
'use strict'

const crypto = require('crypto')
const expect = require('chai').expect

module.exports = (http) => {
  describe('/files', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    describe('/add', () => {
      it('should add buffer bigger than Hapi default max bytes (1024 * 1024)', (done) => {
        const payload = Buffer.from([
          '',
          '------------287032381131322',
          'Content-Disposition: form-data; name="test"; filename="test.txt"',
          'Content-Type: text/plain',
          '',
          crypto.randomBytes(1024 * 1024 * 2).toString('hex'),
          '------------287032381131322--'
        ].join('\r\n'))

        api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: {
            'Content-Type': 'multipart/form-data; boundary=----------287032381131322'
          },
          payload
        }, (res) => {
          expect(res.statusCode).to.not.equal(413) // Payload too large
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })

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
          expect(res.rawPayload).to.deep.equal(Buffer.from('hello world' + '\n'))
          expect(res.payload).to.equal('hello world' + '\n')
          done()
        })
      })
    })

    describe('/get', () => {}) // TODO

    describe('/ls', () => {}) // TODO
  })
}

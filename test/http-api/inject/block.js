/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')

module.exports = (http) => {
  describe('/block', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    describe('/block/put', () => {
      it('returns 400 if no node is provided', (done) => {
        const form = new FormData()
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            done()
          })
        })
      })

      it('updates value', (done) => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/hello'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedResult = {
          Key: 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          Size: 12
        }

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.deep.equal(expectedResult)
            done()
          })
        })
      })

      it('should put a value and return a base64 encoded CID', (done) => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put?cid-base=base64',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Key)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not put a value for invalid cid-base option', (done) => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put?cid-base=invalid',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
        })
      })
    })

    describe('/block/get', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/get'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/get?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns value', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/get?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result)
            .to.equal('hello world\n')
          done()
        })
      })
    })

    describe('/block/stat', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/stat'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/stat?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns value', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/stat?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key)
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(res.result.Size).to.equal(12)
          done()
        })
      })

      it('should stat a block and return a base64 encoded CID', (done) => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put?cid-base=base64',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Key)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not stat a block for invalid cid-base option', (done) => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put?cid-base=invalid',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
        })
      })
    })

    describe('/block/rm', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/rm'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/rm?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns 200', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/rm?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })
  })
}

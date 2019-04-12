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
      api = http.api._httpApi._apiServers[0]
    })

    describe('/block/put', () => {
      it('returns 400 if no node is provided', async () => {
        const form = new FormData()
        const headers = form.getHeaders()
        const payload = await streamToPromise(form)

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/block/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('updates value', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/hello'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedResult = {
          Key: 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          Size: 12
        }

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/block/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal(expectedResult)
      })

      it('should put a value and return a base64 encoded CID', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/block/put?cid-base=base64',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Key)).to.deep.equal('base64')
      })

      it('should not put a value for invalid cid-base option', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/block/put?cid-base=invalid',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/block/get', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/get'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/get?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/get?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.equal('hello world\n')
      })
    })

    describe('/block/stat', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/stat'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/stat?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/stat?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Key)
          .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
        expect(res.result.Size).to.equal(12)
      })

      it('should stat a block and return a base64 encoded CID', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/block/put?cid-base=base64',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Key)).to.deep.equal('base64')
      })

      it('should not stat a block for invalid cid-base option', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/block/put?cid-base=invalid',
          headers,
          payload
        })
        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/block/rm', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/rm'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/rm?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 200', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/block/rm?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        })

        expect(res.statusCode).to.equal(200)
      })
    })
  })
}

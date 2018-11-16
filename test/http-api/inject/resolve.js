/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')

module.exports = (http) => {
  describe('resolve', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    it('should resolve a path and return a base2 encoded CID', done => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      streamToPromise(form).then((payload) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: headers,
          payload: payload
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          const hash = JSON.parse(res.result).Hash

          api.inject({
            method: 'POST',
            url: `/api/v0/resolve?arg=/ipfs/${hash}&cid-base=base2`
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Path.replace('/ipfs/', ''))).to.deep.equal('base2')
            done()
          })
        })
      })
    })

    it('should not resolve a path for invalid cid-base option', done => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      streamToPromise(form).then((payload) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: headers,
          payload: payload
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          const hash = JSON.parse(res.result).Hash

          api.inject({
            method: 'POST',
            url: `/api/v0/resolve?arg=/ipfs/${hash}&cid-base=invalid`
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
        })
      })
    })
  })
}

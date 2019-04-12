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
      api = http.api._httpApi._apiServers[0]
    })

    it('should resolve a path and return a base2 encoded CID', async () => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      let res = await api.inject({
        method: 'POST',
        url: '/api/v0/add',
        headers: headers,
        payload: payload
      })
      expect(res.statusCode).to.equal(200)
      const hash = JSON.parse(res.result).Hash

      res = await api.inject({
        method: 'POST',
        url: `/api/v0/resolve?arg=/ipfs/${hash}&cid-base=base2`
      })

      expect(res.statusCode).to.equal(200)
      expect(multibase.isEncoded(res.result.Path.replace('/ipfs/', ''))).to.deep.equal('base2')
    })

    it('should not resolve a path for invalid cid-base option', async () => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      let res = await api.inject({
        method: 'POST',
        url: '/api/v0/add',
        headers: headers,
        payload: payload
      })
      expect(res.statusCode).to.equal(200)
      const hash = JSON.parse(res.result).Hash

      res = await api.inject({
        method: 'POST',
        url: `/api/v0/resolve?arg=/ipfs/${hash}&cid-base=invalid`
      })
      expect(res.statusCode).to.equal(400)
      expect(res.result.Message).to.include('Invalid request query input')
    })
  })
}

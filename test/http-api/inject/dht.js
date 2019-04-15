/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (http) => {
  describe('/dht', () => {
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    describe('/findpeer', () => {
      it('returns 400 if no peerId is provided', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/findpeer`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.be.eql(1)
      })

      it('returns 404 if peerId is provided as there is no peers in the routing table', async () => {
        const peerId = 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A'
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/findpeer?arg=${peerId}`
        })

        expect(res.statusCode).to.equal(404)
      })
    })

    describe('/findprovs', () => {
      it('returns 400 if no key is provided', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/findprovs`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.be.eql(1)
      })

      it('returns 200 if key is provided', async () => {
        const key = 'Qmc77hSNykXJ6Jxp1C6RpD8VENV7RK6JD7eAcWpc7nEZx2'
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/findprovs?arg=${key}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Type).to.be.eql(4)
      })
    })

    describe('/get', () => {
      it('returns 400 if no key is provided', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/get`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.be.eql(1)
      })

      it('returns 200 if key is provided', async () => {
        const key = 'key'
        const value = 'value'

        let res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/put?arg=${key}&arg=${value}`
        })

        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/get?arg=${key}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Type).to.be.eql(5)
        expect(res.result.Extra).to.be.eql(value)
      })
    })

    describe('/provide', () => {
      it('returns 400 if no key is provided', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/provide`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.be.eql(1)
      })

      it('returns 500 if key is provided as the file was not added', async () => {
        const key = 'Qmc77hSNykXJ6Jxp1C6RpD8VENV7RK6JD7eAcWpc7nEZx2'
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/provide?arg=${key}`
        })

        expect(res.statusCode).to.equal(500) // needs file add
      })
    })

    describe('/put', () => {
      it('returns 400 if no key or value is provided', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/put`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.be.eql(1)
      })

      it('returns 200 if key and value is provided', async function () {
        this.timeout(60 * 1000)

        const key = 'key'
        const value = 'value'

        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/dht/put?arg=${key}&arg=${value}`
        })

        expect(res.statusCode).to.equal(200)
      })
    })
  })
}

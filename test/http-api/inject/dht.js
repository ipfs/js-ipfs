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
      api = http.api.server.select('API')
    })

    describe('/findpeer', () => {
      it('returns 400 if no peerId is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/dht/findpeer`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 500 if peerId is provided as there is no peers in the routing table', (done) => {
        const peerId = 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A'

        api.inject({
          method: 'GET',
          url: `/api/v0/dht/findpeer?arg=${peerId}`
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          done()
        })
      })
    })

    describe('/findprovs', () => {
      it('returns 400 if no key is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/dht/findprovs`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 200 if key is provided', (done) => {
        const key = 'Qmc77hSNykXJ6Jxp1C6RpD8VENV7RK6JD7eAcWpc7nEZx2'

        api.inject({
          method: 'GET',
          url: `/api/v0/dht/findprovs?arg=${key}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.type).to.be.eql(4)
          done()
        })
      })
    })

    describe('/get', () => {
      it('returns 400 if no key is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/dht/get`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 200 if key is provided', (done) => {
        const key = 'key'
        const value = 'value'

        api.inject({
          method: 'GET',
          url: `/api/v0/dht/put?arg=${key}&arg=${value}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          api.inject({
            method: 'GET',
            url: `/api/v0/dht/get?arg=${key}`
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result.Type).to.be.eql(5)
            expect(res.result.Extra).to.be.eql(value)
            done()
          })
        })
      })
    })

    describe('/provide', () => {
      it('returns 400 if no key is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/dht/provide`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 500 if key is provided as the file was not added', (done) => {
        const key = 'Qmc77hSNykXJ6Jxp1C6RpD8VENV7RK6JD7eAcWpc7nEZx2'

        api.inject({
          method: 'GET',
          url: `/api/v0/dht/provide?arg=${key}`
        }, (res) => {
          expect(res.statusCode).to.equal(500) // needs file add
          done()
        })
      })
    })

    describe('/put', () => {
      it('returns 400 if no key or value is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/dht/put`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 200 if key and value is provided', function (done) {
        this.timeout(60 * 1000)
        const key = 'key'
        const value = 'value'

        api.inject({
          method: 'GET',
          url: `/api/v0/dht/put?arg=${key}&arg=${value}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })
  })
}

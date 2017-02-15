/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const qs = require('qs')
const defaultList = require('../../../src/init-files/default-config-node.json').Bootstrap

module.exports = (http) => {
  describe('/bootstrap', () => {
    const validIp4 = '/ip4/101.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'
    let api

    before((done) => {
      api = http.api.server.select('API')
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/add',
        payload: {
          default: 'true'
        }
      }, () => done())
    })

    it('/list', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/list'
      }, (res) => {
        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.deep.equal(defaultList)
        done()
      })
    })

    it('/list alias', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap'
      }, (res) => {
        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.deep.equal(defaultList)
        done()
      })
    })

    it('/add', (done) => {
      const query = {
        arg: validIp4
      }

      api.inject({
        method: 'GET',
        url: `/api/v0/bootstrap/add?${qs.stringify(query)}`
      }, (res) => {
        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.be.eql([validIp4])
        done()
      })
    })

    it('/rm', (done) => {
      const query = {
        arg: validIp4
      }

      api.inject({
        method: 'GET',
        url: `/api/v0/bootstrap/rm?${qs.stringify(query)}`
      }, (res) => {
        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.be.eql([validIp4])
        done()
      })
    })

    it('/list confirm it changed', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/list'
      }, (res) => {
        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.be.eql(defaultList)
        done()
      })
    })
  })
}

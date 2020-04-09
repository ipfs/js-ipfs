/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const qs = require('qs')
const defaultList = require('../../../src/core/runtime/config-nodejs.js')().Bootstrap

module.exports = (http) => {
  describe('/bootstrap', () => {
    const validIp4 = '/ip4/101.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
      return api.inject({
        method: 'POST',
        url: '/api/v0/bootstrap/add/default'
      })
    })

    describe('/list', () => {
      it('only accepts POST', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/bootstrap/list'
        })

        expect(res.statusCode).to.equal(404)
      })

      it('returns a list', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/bootstrap/list'
        })

        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.deep.equal(defaultList)
      })

      it('alias', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/bootstrap'
        })

        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.deep.equal(defaultList)
      })
    })

    describe('/add', () => {
      it('only accepts POST', async () => {
        const query = {
          arg: validIp4
        }

        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/bootstrap/add?${qs.stringify(query)}`
        })

        expect(res.statusCode).to.equal(404)
      })

      it('adds a bootstrapper', async () => {
        const query = {
          arg: validIp4
        }

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/bootstrap/add?${qs.stringify(query)}`
        })

        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.be.eql([validIp4])
      })

      it('restores default', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/bootstrap/add/default'
        })

        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.be.eql(defaultList)
      })
    })

    describe('/rm', () => {
      it('only accepts POST', async () => {
        const query = {
          arg: validIp4
        }

        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/bootstrap/rm?${qs.stringify(query)}`
        })

        expect(res.statusCode).to.equal(404)
      })

      it('removes a bootstrapper', async () => {
        const query = {
          arg: validIp4
        }

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/bootstrap/rm?${qs.stringify(query)}`
        })

        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.be.eql([validIp4])
      })

      it('removes all bootstrappers', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/bootstrap/rm/all'
        })

        expect(res.statusCode).to.be.eql(200)
        expect(res.result.Peers).to.be.eql(defaultList)
      })
    })
  })
}

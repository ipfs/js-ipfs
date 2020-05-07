/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const { Buffer } = require('buffer')
const sinon = require('sinon')
const errCode = require('err-code')
const CID = require('cids')

// TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994
describe('/dht', () => {
  const peerId = new CID('QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A')
  const cid = new CID('Qmc77hSNykXJ6Jxp1C6RpD8VENV7RK6JD7eAcWpc7nEZx2')
  let ipfs

  beforeEach(() => {
    ipfs = {
      dht: {
        findPeer: sinon.stub(),
        findProvs: sinon.stub(),
        get: sinon.stub(),
        provide: sinon.stub(),
        put: sinon.stub(),
        query: sinon.stub()
      }
    }
  })

  describe('/findpeer', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dht/findpeer')
    })

    it('returns 400 if no peerId is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/findpeer'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
    })

    it('returns 404 if peerId is provided as there is no peers in the routing table', async () => {
      ipfs.dht.findPeer.withArgs(peerId).throws(errCode(new Error('Nope'), 'ERR_LOOKUP_FAILED'))

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/findpeer?arg=${peerId}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 404)
    })
  })

  describe('/findprovs', () => {
    it('only accepts POST', async () => {
      const res = await http({
        method: 'GET',
        url: '/api/v0/dht/findprovs'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 405)
    })

    it('returns 400 if no key is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/findprovs'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
    })

    it('returns 200 if key is provided', async () => {
      ipfs.dht.findProvs.withArgs(cid).returns([{
        id: peerId,
        addrs: [
          'addr'
        ]
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/findprovs?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Type', 4)
      expect(res).to.have.nested.property('result.Responses[0].ID', peerId.toString())
      expect(res).to.have.nested.property('result.Responses[0].Addrs[0]', 'addr')
    })

    it('overrides num-providers', async () => {
      ipfs.dht.findProvs.withArgs(cid, sinon.match({
        numProviders: 10
      })).returns([{
        id: peerId,
        addrs: [
          'addr'
        ]
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/findprovs?arg=${cid}&num-providers=10`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Type', 4)
      expect(res).to.have.nested.property('result.Responses[0].ID', peerId.toString())
      expect(res).to.have.nested.property('result.Responses[0].Addrs[0]', 'addr')
    })
  })

  describe('/get', () => {
    it('only accepts POST', async () => {
      const res = await http({
        method: 'GET',
        url: '/api/v0/dht/get'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 405)
    })

    it('returns 400 if no key is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/get'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
    })

    it('returns 200 if key is provided', async () => {
      const key = 'key'
      const value = 'value'
      ipfs.dht.get.withArgs(Buffer.from(key)).returns(value)

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/get?arg=${key}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Type', 5)
      expect(res).to.have.nested.property('result.Extra', value)
    })
  })

  describe('/provide', () => {
    it('only accepts POST', async () => {
      const res = await http({
        method: 'GET',
        url: '/api/v0/dht/provide'
      }, { ipfs })

      expect(res.statusCode).to.equal(405)
    })

    it('returns 400 if no key is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/provide'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
    })

    it('returns 500 if key is invalid', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/provide?arg=derp'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 500) // needs file add
      expect(ipfs.dht.provide.called).to.be.false()
    })

    it('returns 500 if key is provided as the file was not added', async () => {
      ipfs.dht.provide.withArgs(cid).throws(new Error('wut'))

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/provide?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 500) // needs file add
    })

    it('returns 200 if key is provided', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/provide?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200) // needs file add
      expect(ipfs.dht.provide.calledWith(cid)).to.be.true()
    })
  })

  describe('/put', () => {
    it('only accepts POST', async () => {
      const res = await http({
        method: 'GET',
        url: '/api/v0/dht/put'
      }, { ipfs })

      expect(res.statusCode).to.equal(405)
    })

    it('returns 400 if no key or value is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/put'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
    })

    it('returns 200 if key and value is provided', async function () {
      const key = 'key'
      const value = 'value'

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/put?arg=${key}&arg=${value}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.dht.put.calledWith(Buffer.from(key), Buffer.from(value))).to.be.true()
    })
  })

  describe('/query', () => {
    it('only accepts POST', async () => {
      const res = await http({
        method: 'GET',
        url: '/api/v0/dht/query'
      }, { ipfs })

      expect(res.statusCode).to.equal(405)
    })

    it('returns 400 if no key or value is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/query'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
    })

    it('returns 200 if key and value is provided', async function () {
      const key = 'key'

      ipfs.dht.query.withArgs(key).returns([{
        id: 'id'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/query?arg=${key}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(JSON.parse(res.result)).to.have.property('ID', 'id')
    })
  })
})

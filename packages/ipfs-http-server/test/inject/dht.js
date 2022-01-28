/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'
import errCode from 'err-code'
import { CID } from 'multiformats/cid'
import { allNdjson } from '../utils/all-ndjson.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import FormData from 'form-data'
import streamToPromise from 'stream-to-promise'

describe('/dht', () => {
  const peerId = 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A'
  const cid = CID.parse('Qmc77hSNykXJ6Jxp1C6RpD8VENV7RK6JD7eAcWpc7nEZx2')
  let ipfs

  beforeEach(() => {
    ipfs = {
      id: sinon.stub().resolves({ id: 'Qmfoo' }),
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
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal)
    }

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

    it('returns 500 if peerId is provided and there are no peers in the routing table', async () => {
      ipfs.dht.findPeer.withArgs(peerId, defaultOptions).throws(errCode(new Error('Nope'), 'ERR_LOOKUP_FAILED'))

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/findpeer?arg=${peerId}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 500)
      expect(ipfs.dht.findPeer.called).to.be.true()
      expect(ipfs.dht.findPeer.getCall(0).args[0]).to.equal(peerId)
    })
  })

  describe('/findprovs', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal)
    }

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
      ipfs.dht.findProvs.withArgs(cid, defaultOptions).returns([{
        name: 'PROVIDER',
        type: 4,
        providers: [{
          id: peerId,
          multiaddrs: [
            'addr'
          ]
        }]
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/findprovs?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        Extra: '',
        Type: 4,
        Responses: [{
          ID: peerId,
          Addrs: ['addr']
        }]
      }])
    })

    it('overrides num-providers', async () => {
      const providers = new Array(20).fill(0).map((val, i) => ({
        id: peerId + i,
        multiaddrs: [
          'addr'
        ]
      }))

      ipfs.dht.findProvs.withArgs(cid, {
        ...defaultOptions
      }).returns([{
        name: 'PROVIDER',
        type: 4,
        providers: providers.slice(0, 4)
      }, {
        name: 'PROVIDER',
        type: 4,
        providers: providers.slice(4, 8)
      }, {
        name: 'PROVIDER',
        type: 4,
        providers: providers.slice(8, 12)
      }, {
        name: 'PROVIDER',
        type: 4,
        providers: providers.slice(12)
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/findprovs?arg=${cid}&num-providers=10`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)

      const provs = allNdjson(res).map(event => event.Responses).reduce((acc, curr) => {
        return acc.concat(...curr)
      }, [])

      // should ignore subsequent providers after reaching limit
      expect(provs).to.have.lengthOf(12)
    })
  })

  describe('/get', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal)
    }

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
      const value = Buffer.from('hello world')
      ipfs.dht.get.withArgs(key, defaultOptions).returns([{
        type: 5,
        name: 'VALUE',
        value: value
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/get?arg=${key}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        Extra: uint8ArrayToString(value, 'base64pad'),
        Type: 5,
        Responses: null
      }])
    })
  })

  describe('/provide', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal)
    }

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

    it('returns 400 if key is invalid', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dht/provide?arg=derp'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(ipfs.dht.provide.called).to.be.false()
    })

    it('returns 500 if key is provided as the file was not added', async () => {
      ipfs.dht.provide.withArgs(cid, defaultOptions).throws(new Error('wut'))

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/provide?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 500) // needs file add
    })

    it('returns 200 if key is provided', async () => {
      ipfs.dht.provide.withArgs(cid, defaultOptions).returns([{
        name: 'DIALING_PEER',
        type: 7,
        peer: peerId
      }, {
        name: 'SENDING_QUERY',
        type: 0,
        to: peerId
      }, {
        name: 'PEER_RESPONSE',
        type: 1,
        from: peerId,
        closer: [],
        providers: []
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/provide?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200) // needs file add
      expect(allNdjson(res)).to.deep.equal([{
        Extra: '',
        ID: peerId,
        Type: 7,
        Responses: null
      }, {
        Extra: '',
        ID: peerId,
        Type: 0,
        Responses: null
      }, {
        Extra: '',
        ID: peerId,
        Type: 1,
        Responses: []
      }])
    })
  })

  describe('/put', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal)
    }

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
      const value = Buffer.from('value')

      ipfs.dht.put.withArgs(key, value, defaultOptions).returns([{
        name: 'DIALING_PEER',
        type: 7,
        peer: peerId
      }, {
        name: 'SENDING_QUERY',
        type: 0,
        to: peerId
      }, {
        name: 'PEER_RESPONSE',
        type: 1,
        from: peerId,
        closer: [],
        providers: []
      }])

      const form = new FormData()
      form.append('data', value)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/put?arg=${key}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        Extra: '',
        ID: peerId,
        Type: 7,
        Responses: null
      }, {
        Extra: '',
        ID: peerId,
        Type: 0,
        Responses: null
      }, {
        Extra: '',
        ID: peerId,
        Type: 1,
        Responses: []
      }])
    })
  })

  describe('/query', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal)
    }

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

    it('returns 200 if key is provided', async function () {
      ipfs.dht.query.withArgs(peerId, defaultOptions).returns([{
        name: 'DIALING_PEER',
        type: 7,
        peer: peerId
      }, {
        name: 'SENDING_QUERY',
        type: 0,
        to: peerId
      }, {
        name: 'PEER_RESPONSE',
        type: 1,
        from: peerId,
        closer: [],
        providers: []
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dht/query?arg=${peerId}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        Extra: '',
        ID: peerId,
        Type: 7,
        Responses: null
      }, {
        Extra: '',
        ID: peerId,
        Type: 0,
        Responses: null
      }, {
        Extra: '',
        ID: peerId,
        Type: 1,
        Responses: []
      }])
    })
  })
})

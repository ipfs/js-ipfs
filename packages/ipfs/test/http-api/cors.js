/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const http = require('../utils/http')
const sinon = require('sinon')

describe('cors', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      id: sinon.stub().returns({
        id: 'id',
        publicKey: 'publicKey',
        addresses: 'addresses',
        agentVersion: 'agentVersion',
        protocolVersion: 'protocolVersion'
      })
    }
  })

  describe('should allow configuring CORS', () => {
    it('returns allowed origins when origin is supplied in request', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin
        }
      }, { ipfs, cors: { origin: [origin] } })

      expect(res).to.have.nested.property('headers.access-control-allow-origin', origin)
    })

    it('does not allow credentials when omitted in config', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin
        }
      }, { ipfs, cors: { origin: [origin] } })

      expect(res).to.not.have.nested.property('headers.access-control-allow-credentials')
    })

    it('returns allowed credentials when origin is supplied in request', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin
        }
      }, { ipfs, cors: { origin: [origin], credentials: true } })

      expect(res).to.have.nested.property('headers.access-control-allow-credentials', 'true')
    })

    it('does not return allowed origins when origin is not supplied in request', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id'
      }, { ipfs, cors: { origin: [origin] } })

      expect(res).to.not.have.nested.property('headers.access-control-allow-origin')
    })

    it('does not return allowed credentials when origin is not supplied in request', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id'
      }, { ipfs, cors: { origin: [origin], credentials: true } })

      expect(res).to.not.have.nested.property('headers.access-control-allow-credentials')
    })

    it('does not return allowed origins when different origin is supplied in request', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin: origin + '/'
        }
      }, { ipfs, cors: { origin: [origin] } })

      expect(res).to.not.have.nested.property('headers.access-control-allow-origin')
    })

    it('allows wildcard origins', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin: origin + '/'
        }
      }, { ipfs, cors: { origin: ['*'] } })

      expect(res).to.have.nested.property('headers.access-control-allow-origin', origin + '/')
    })

    it('makes preflight request for post', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'OPTIONS',
        url: '/api/v0/id',
        headers: {
          origin,
          'Access-Control-Request-Method': 'POST',
          // browsers specifying custom headers triggers CORS pre-flight requests
          // so simulate that here
          'Access-Control-Request-Headers': 'X-Stream-Output'
        }
      }, {
        ipfs,
        cors: { origin: [origin] }
      })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('headers.access-control-allow-origin', origin)
      expect(res).to.have.nested.property('headers.access-control-allow-methods').that.includes('POST')
      expect(res).to.have.nested.property('headers.access-control-allow-headers').that.includes('X-Stream-Output')
    })

    it('responds with 404 for preflight request for get', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'OPTIONS',
        url: '/api/v0/id',
        headers: {
          origin,
          'Access-Control-Request-Method': 'GET',
          // browsers specifying custom headers triggers CORS pre-flight requests
          // so simulate that here
          'Access-Control-Request-Headers': 'X-Stream-Output'
        }
      }, {
        ipfs,
        cors: { origin: [origin] }
      })

      expect(res).to.have.property('statusCode', 404)
    })
  })
})

/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from './utils/http.js'
import sinon from 'sinon'

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

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('headers.access-control-allow-origin', origin)
    })

    it('allows request when referer is supplied in request', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          referer: origin + '/index.html'
        }
      }, { ipfs, cors: { origin: [origin] } })

      expect(res).to.have.property('statusCode', 200)
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

    it('rejects requests when cors origin list is empty and origin is sent', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin
        }
      }, {
        ipfs,
        cors: { origin: [] }
      })

      expect(res).to.have.property('statusCode', 403)
    })

    it('rejects requests when cors origin list is empty and referer is sent', async () => {
      const referer = 'http://localhost:8080/index.html'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          referer
        }
      }, {
        ipfs,
        cors: { origin: [] }
      })

      expect(res).to.have.property('statusCode', 403)
    })

    it('rejects requests when cors origin list is empty and referer and origin are sent', async () => {
      const referer = 'http://localhost:8080/index.html'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          referer,
          origin: 'http://localhost:8080'
        }
      }, {
        ipfs,
        cors: { origin: [] }
      })

      expect(res).to.have.property('statusCode', 403)
    })

    it('rejects requests when cors origin list is empty and origin is sent as "null" (e.g. data urls and sandboxed iframes)', async () => {
      const origin = 'null'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin
        }
      }, {
        ipfs,
        cors: { origin: [] }
      })

      expect(res).to.have.property('statusCode', 403)
    })

    it('rejects requests when cors origin list does not contain the correct origin and origin is sent', async () => {
      const origin = 'http://localhost:8080'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          origin
        }
      }, {
        ipfs,
        cors: { origin: ['http://example.com:8080'] }
      })

      expect(res).to.have.property('statusCode', 403)
    })

    it('rejects requests when cors origin list does not contain the correct origin and referer is sent', async () => {
      const referer = 'http://localhost:8080/index.html'
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          referer
        }
      }, {
        ipfs,
        cors: { origin: ['http://example.com:8080'] }
      })

      expect(res).to.have.property('statusCode', 403)
    })
  })
})

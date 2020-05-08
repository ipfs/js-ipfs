/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')
const randomBytes = require('iso-random-stream/src/random')
const { Buffer } = require('buffer')

function encodeBuffer (buf) {
  let uriEncoded = ''
  for (const byte of buf) {
    // https://tools.ietf.org/html/rfc3986#page-14
    // ALPHA (%41-%5A and %61-%7A), DIGIT (%30-%39), hyphen (%2D), period (%2E),
    // underscore (%5F), or tilde (%7E)
    if (
      (byte >= 0x41 && byte <= 0x5A) ||
      (byte >= 0x61 && byte <= 0x7A) ||
      (byte >= 0x30 && byte <= 0x39) ||
      (byte === 0x2D) ||
      (byte === 0x2E) ||
      (byte === 0x5F) ||
      (byte === 0x7E)
    ) {
      uriEncoded += String.fromCharCode(byte)
    } else {
      uriEncoded += `%${byte.toString(16).padStart(2, '0')}`
    }
  }
  return uriEncoded
}

describe('/pubsub', () => {
  const buf = Buffer.from('some message')
  const topic = 'nonScents'
  const topicNotSubscribed = 'somethingRandom'

  let ipfs

  beforeEach(() => {
    ipfs = {
      pubsub: {
        subscribe: sinon.stub(),
        unsubscribe: sinon.stub(),
        publish: sinon.stub(),
        ls: sinon.stub(),
        peers: sinon.stub()
      }
    }
  })

  describe('/sub', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/pubsub/sub')
    })

    it('returns 400 if no topic is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/pubsub/sub'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it.skip('returns 200 with topic', async () => {
      // need to simulate 'disconnect' events somehow in order to close
      // the response stream and let the request promise resolve
      // https://github.com/hapijs/shot/issues/121
      ipfs.pubsub.unsubscribe.withArgs(topic).resolves(undefined)

      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/sub?arg=${topic}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.pubsub.subscribe.calledWith(topic)).to.be.true()
    })
  })

  describe('/pub', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/pubsub/pub')
    })

    it('returns 400 if no buffer is provided', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/pubsub/pub?arg=&arg='
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns 200 with topic and buffer', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/pub?arg=${topic}&arg=${buf}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.pubsub.publish.calledWith(topic, buf, defaultOptions)).to.be.true()
    })

    it('returns 200 with topic and unprintable buffer', async () => {
      const buf = randomBytes(10)
      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/pub?arg=${topic}&arg=${encodeBuffer(buf)}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.pubsub.publish.calledWith(topic, buf, defaultOptions)).to.be.true()
    })

    it('returns 400 with topic and empty buffer', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/pub?arg=${topic}&arg=${encodeBuffer([])}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('accepts a timeout', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/pub?arg=${topic}&arg=${buf}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.pubsub.publish.calledWith(topic, buf, {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })

  describe('/ls', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/pubsub/ls')
    })

    it('returns 200', async () => {
      ipfs.pubsub.ls.withArgs(defaultOptions).returns([
        topic
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pubsub/ls'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [topic])
    })

    it('accepts a timeout', async () => {
      ipfs.pubsub.ls.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([
        topic
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pubsub/ls?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [topic])
    })
  })

  describe('/peers', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/pubsub/peers')
    })

    it('returns 200 if not subscribed to a topic', async () => {
      ipfs.pubsub.peers.withArgs(topicNotSubscribed, defaultOptions).returns([])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/peers?arg=${topicNotSubscribed}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [])
    })

    it('returns 200 with topic', async () => {
      ipfs.pubsub.peers.withArgs(topic, defaultOptions).returns([
        'peer'
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/peers?arg=${topic}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [
        'peer'
      ])
    })

    it('accepts a timeout', async () => {
      ipfs.pubsub.peers.withArgs(topic, {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        'peer'
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/peers?arg=${topic}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [
        'peer'
      ])
    })
  })
})

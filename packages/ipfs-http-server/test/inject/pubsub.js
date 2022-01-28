/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import FormData from 'form-data'
import sinon from 'sinon'
import { randomBytes } from 'iso-random-stream'
import streamToPromise from 'stream-to-promise'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { base64url } from 'multiformats/bases/base64'

const sendData = async (data) => {
  const form = new FormData()
  form.append('data', data)
  const headers = form.getHeaders()
  const payload = await streamToPromise(form)
  return {
    headers,
    payload
  }
}
const textToUrlSafeRpc = text => base64url.encode(uint8ArrayFromString(text))

describe('/pubsub', () => {
  const buf = Buffer.from('some message')
  const topic = 'nonScents'
  const topicRpcEnc = textToUrlSafeRpc(topic)
  const topicNotSubscribed = 'somethingRandom'
  const topicNotSubscribedRpcEnc = textToUrlSafeRpc(topicNotSubscribed)

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
        url: `/api/v0/pubsub/sub?arg=${topicRpcEnc}`
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
        url: `/api/v0/pubsub/pub?arg=${topicRpcEnc}`,
        ...await sendData(buf)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.pubsub.publish.calledWith(topic, buf, defaultOptions)).to.be.true()
    })

    it('returns 200 with topic and unprintable buffer', async () => {
      const buf = randomBytes(10)
      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/pub?arg=${topicRpcEnc}`,
        ...await sendData(buf)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.pubsub.publish.calledWith(topic, buf, defaultOptions)).to.be.true()
    })

    it('returns 400 with topic and empty buffer', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/pub?arg=${topicRpcEnc}`,
        ...await sendData(Buffer.from(''))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('accepts a timeout', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/pub?arg=${topicRpcEnc}&timeout=1s`,
        ...await sendData(buf)
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
      expect(res).to.have.deep.nested.property('result.Strings', [topicRpcEnc])
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
      expect(res).to.have.deep.nested.property('result.Strings', [topicRpcEnc])
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
        url: `/api/v0/pubsub/peers?arg=${topicNotSubscribedRpcEnc}`
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
        url: `/api/v0/pubsub/peers?arg=${topicRpcEnc}`
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
        url: `/api/v0/pubsub/peers?arg=${topicRpcEnc}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [
        'peer'
      ])
    })
  })
})

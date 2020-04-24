/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { Buffer } = require('buffer')

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
      expect(ipfs.pubsub.publish.calledWith(topic, buf)).to.be.true()
    })
  })

  describe('/ls', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/pubsub/ls')
    })

    it('returns 200', async () => {
      ipfs.pubsub.ls.returns([
        topic
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pubsub/ls'
      }, { ipfs })
      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [topic])
    })
  })

  describe('/peers', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/pubsub/peers')
    })

    it('returns 200 if not subscribed to a topic', async () => {
      ipfs.pubsub.peers.withArgs(topicNotSubscribed).returns([])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pubsub/peers?arg=${topicNotSubscribed}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Strings', [])
    })

    it('returns 200 with topic', async () => {
      ipfs.pubsub.peers.withArgs(topic).returns([
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
  })
})

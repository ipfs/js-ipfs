/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

describe('/name', function () {
  const cid = new CID('QmbndGRXYRyfU41TUvc52gMrwq87JJg18QsDPcCeaMcM61')
  let ipfs

  beforeEach(() => {
    ipfs = {
      name: {
        resolve: sinon.stub(),
        publish: sinon.stub(),
        pubsub: {
          state: sinon.stub(),
          subs: sinon.stub(),
          cancel: sinon.stub()
        }
      }
    }
  })

  describe('/publish', () => {
    const defaultOptions = {
      resolve: true,
      lifetime: '24h',
      ttl: undefined,
      key: 'self',
      allowOffline: undefined,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod(`/api/v0/name/publish?arg=${cid}&resolve=false`)
    })

    it('should publish a record', async () => {
      const resolve = true
      const lifetime = '24h'
      const ttl = 'ttl'
      const key = 'key'
      const allowOffline = true
      const name = 'name'

      ipfs.name.publish.withArgs(cid.toString(), {
        ...defaultOptions,
        resolve,
        lifetime,
        ttl,
        key,
        allowOffline
      }).returns({
        name,
        value: cid.toString()
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/name/publish?arg=${cid}&resolve=${resolve}&lifetime=${lifetime}&ttl=${ttl}&key=${key}&allow-offline=${allowOffline}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Name', name)
      expect(res).to.have.nested.property('result.Value', cid.toString())
    })

    it('accepts a timeout', async () => {
      const name = 'name'

      ipfs.name.publish.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        name,
        value: cid.toString()
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/name/publish?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Name', name)
      expect(res).to.have.nested.property('result.Value', cid.toString())
    })
  })

  describe('/resolve', () => {
    const defaultOptions = {
      nocache: false,
      recursive: true,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/name/resolve')
    })

    it('should resolve a record', async () => {
      const nocache = true
      const recursive = true

      ipfs.name.resolve.withArgs(cid.toString(), {
        ...defaultOptions,
        nocache,
        recursive
      }).returns([
        cid.toString()
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/name/resolve?arg=${cid}&nocache=${nocache}&recursive=${recursive}`
      }, { ipfs })

      expect(res).to.exist()
      expect(res).to.have.nested.property('result.Path', cid.toString())
    })

    it('should resolve a record in streaming mode', async () => {
      const nocache = true
      const recursive = true

      ipfs.name.resolve.withArgs(cid.toString(), {
        ...defaultOptions,
        nocache,
        recursive
      }).returns([
        cid.toString()
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/name/resolve?arg=${cid}&nocache=${nocache}&recursive=${recursive}&stream=true`
      }, { ipfs })

      expect(res).to.exist()
      expect(res).to.have.property('result')
      expect(JSON.parse(res.result)).to.have.property('Path', cid.toString())
    })

    it('accepts a timeout', async () => {
      ipfs.name.resolve.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        cid.toString()
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/name/resolve?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.exist()
      expect(res).to.have.nested.property('result.Path', cid.toString())
    })
  })

  describe('/pubsub', () => {
    describe('/state', () => {
      const defaultOptions = {
        signal: sinon.match.instanceOf(AbortSignal),
        timeout: undefined
      }

      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/name/pubsub/state')
      })

      it('should return enabled state', async () => {
        ipfs.name.pubsub.state.withArgs(defaultOptions).returns({
          enabled: true
        })

        const res = await http({
          method: 'POST',
          url: '/api/v0/name/pubsub/state'
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Enabled', true)
      })

      it('accepts a timeout', async () => {
        ipfs.name.pubsub.state.withArgs({
          ...defaultOptions,
          timeout: 1000
        }).returns({
          enabled: true
        })

        const res = await http({
          method: 'POST',
          url: '/api/v0/name/pubsub/state?timeout=1s'
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Enabled', true)
      })
    })

    describe('/subs', () => {
      const defaultOptions = {
        signal: sinon.match.instanceOf(AbortSignal),
        timeout: undefined
      }

      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/name/pubsub/subs')
      })

      it('should return subscriptions', async () => {
        ipfs.name.pubsub.subs.withArgs(defaultOptions).returns('value')

        const res = await http({
          method: 'POST',
          url: '/api/v0/name/pubsub/subs'
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Strings', 'value')
      })

      it('accepts a timeout', async () => {
        ipfs.name.pubsub.subs.withArgs({
          ...defaultOptions,
          timeout: 1000
        }).returns('value')

        const res = await http({
          method: 'POST',
          url: '/api/v0/name/pubsub/subs?timeout=1s'
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Strings', 'value')
      })
    })

    describe('/cancel', () => {
      const defaultOptions = {
        signal: sinon.match.instanceOf(AbortSignal),
        timeout: undefined
      }

      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/name/pubsub/cancel')
      })

      it('should cancel subscription', async () => {
        const name = 'name'

        ipfs.name.pubsub.cancel.withArgs(name, defaultOptions).returns({
          canceled: true
        })

        const res = await http({
          method: 'POST',
          url: `/api/v0/name/pubsub/cancel?arg=${name}`
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Canceled', true)
      })

      it('accepts a timeout', async () => {
        const name = 'name'

        ipfs.name.pubsub.cancel.withArgs(name, {
          ...defaultOptions,
          timeout: 1000
        }).returns({
          canceled: true
        })

        const res = await http({
          method: 'POST',
          url: `/api/v0/name/pubsub/cancel?arg=${name}&timeout=1s`
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Canceled', true)
      })
    })
  })
})

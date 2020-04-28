/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')

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

      ipfs.name.publish.withArgs(cid.toString(), sinon.match({
        resolve,
        lifetime,
        ttl,
        key,
        allowOffline
      })).returns({
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
  })

  describe('/resolve', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/name/resolve')
    })

    it('should resolve a record', async () => {
      const nocache = true
      const recursive = true

      ipfs.name.resolve.withArgs(cid.toString(), sinon.match({
        nocache,
        recursive
      })).returns([
        cid.toString()
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/name/resolve?arg=${cid}&nocache=${nocache}&recursive=${recursive}`
      }, { ipfs })

      expect(res).to.exist()
      expect(res).to.have.nested.property('result.Path', cid.toString())
    })
  })

  describe('/pubsub', () => {
    describe('/pubsub/state', () => {
      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/name/pubsub/state')
      })

      it('should return enabled state', async () => {
        ipfs.name.pubsub.state.returns({
          enabled: true
        })

        const res = await http({
          method: 'POST',
          url: '/api/v0/name/pubsub/state'
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Enabled', true)
      })
    })

    describe('/pubsub/subs', () => {
      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/name/pubsub/subs')
      })

      it('should return subscriptions', async () => {
        ipfs.name.pubsub.subs.returns('value')

        const res = await http({
          method: 'POST',
          url: '/api/v0/name/pubsub/subs'
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Strings', 'value')
      })
    })

    describe('/pubsub/cancel', () => {
      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/name/pubsub/cancel')
      })

      it('should cancel subscription', async () => {
        const name = 'name'

        ipfs.name.pubsub.cancel.withArgs(name).returns({
          canceled: true
        })

        const res = await http({
          method: 'POST',
          url: `/api/v0/name/pubsub/cancel?arg=${name}`
        }, { ipfs })

        expect(res).to.exist()
        expect(res).to.have.nested.property('result.Canceled', true)
      })
    })
  })
})

/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const CID = require('cids')
const sinon = require('sinon')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const { AbortSignal } = require('abort-controller')

describe('/bitswap', () => {
  const cid = new CID('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR')
  let ipfs

  beforeEach(() => {
    ipfs = {
      bitswap: {
        wantlist: sinon.stub(),
        wantlistForPeer: sinon.stub(),
        stat: sinon.stub(),
        unwant: sinon.stub()
      }
    }
  })

  describe('/wantlist', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/bitswap/wantlist')
    })

    it('/wantlist', async () => {
      ipfs.bitswap.wantlist.withArgs(defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/wantlist'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({ '/': cid.toString() })
    })

    it('/wantlist?timeout=1s', async () => {
      ipfs.bitswap.wantlist.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/wantlist?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({ '/': cid.toString() })
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('/wantlist?cid-base=base64', async () => {
      ipfs.bitswap.wantlist.withArgs(defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/wantlist?cid-base=base64'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({ '/': cid.toV1().toString('base64') })
    })

    it('/wantlist?cid-base=invalid', async () => {
      ipfs.bitswap.wantlist.withArgs(defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/wantlist?cid-base=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })

    it('/wantlist?peer=QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D', async () => {
      const peerId = 'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'

      ipfs.bitswap.wantlistForPeer.withArgs(peerId, defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/bitswap/wantlist?peer=${peerId}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({ '/': cid.toString() })
    })

    it('/wantlist?peer=QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D&timeout=1s', async () => {
      const peerId = 'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'

      ipfs.bitswap.wantlistForPeer.withArgs(peerId, {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/bitswap/wantlist?peer=${peerId}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({ '/': cid.toString() })
    })

    it('/wantlist?peer=invalid', async () => {
      const peerId = 'invalid'

      const res = await http({
        method: 'POST',
        url: `/api/v0/bitswap/wantlist?peer=${peerId}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })
  })

  describe('/stat', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/bitswap/stat')
    })

    it('/stat', async () => {
      ipfs.bitswap.stat.withArgs(defaultOptions).returns({
        provideBufLen: 'provideBufLen',
        blocksReceived: 'blocksReceived',
        wantlist: [
          cid
        ],
        peers: 'peers',
        dupBlksReceived: 'dupBlksReceived',
        dupDataReceived: 'dupDataReceived',
        dataReceived: 'dataReceived',
        blocksSent: 'blocksSent',
        dataSent: 'dataSent'
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/stat'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.ProvideBufLen', 'provideBufLen')
      expect(res).to.have.nested.property('result.BlocksReceived', 'blocksReceived')
      expect(res).to.have.nested.property('result.Wantlist').that.deep.includes({ '/': cid.toString() })
      expect(res).to.have.nested.property('result.Peers', 'peers')
      expect(res).to.have.nested.property('result.DupBlksReceived', 'dupBlksReceived')
      expect(res).to.have.nested.property('result.DupDataReceived', 'dupDataReceived')
      expect(res).to.have.nested.property('result.DataReceived', 'dataReceived')
      expect(res).to.have.nested.property('result.BlocksSent', 'blocksSent')
      expect(res).to.have.nested.property('result.DataSent', 'dataSent')
    })

    it('/stat?timeout=1s', async () => {
      ipfs.bitswap.stat.withArgs(defaultOptions).withArgs({
        signal: sinon.match.any,
        timeout: 1000
      }).returns({
        provideBufLen: 'provideBufLen',
        blocksReceived: 'blocksReceived',
        wantlist: [
          cid
        ],
        peers: 'peers',
        dupBlksReceived: 'dupBlksReceived',
        dupDataReceived: 'dupDataReceived',
        dataReceived: 'dataReceived',
        blocksSent: 'blocksSent',
        dataSent: 'dataSent'
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/stat?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    it('/stat?cid-base=base64', async () => {
      ipfs.bitswap.stat.withArgs(defaultOptions).returns({
        provideBufLen: 'provideBufLen',
        blocksReceived: 'blocksReceived',
        wantlist: [
          cid.toV1()
        ],
        peers: 'peers',
        dupBlksReceived: 'dupBlksReceived',
        dupDataReceived: 'dupDataReceived',
        dataReceived: 'dataReceived',
        blocksSent: 'blocksSent',
        dataSent: 'dataSent'
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/stat?cid-base=base64'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Wantlist').that.deep.includes({ '/': cid.toV1().toString('base64') })
    })

    it('/stat?cid-base=invalid', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/stat?cid-base=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })

    it('accepts a timeout', async () => {
      ipfs.bitswap.stat.withArgs(defaultOptions).withArgs(sinon.match({
        timeout: 1000
      })).returns({
        provideBufLen: 'provideBufLen',
        blocksReceived: 'blocksReceived',
        wantlist: [
          cid.toV1()
        ],
        peers: 'peers',
        dupBlksReceived: 'dupBlksReceived',
        dupDataReceived: 'dupDataReceived',
        dataReceived: 'dataReceived',
        blocksSent: 'blocksSent',
        dataSent: 'dataSent'
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/stat?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/unwant', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/bitswap/unwant')
    })

    it('/unwant', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/bitswap/unwant?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.bitswap.unwant.calledWith(new CID(cid), defaultOptions)).to.be.true()
    })

    it('accepts a timeout', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/bitswap/unwant?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.bitswap.unwant.calledWith(new CID(cid), {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })
})

/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import sinon from 'sinon'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'

describe('/bitswap', () => {
  const cid = CID.parse('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR')
  let ipfs

  beforeEach(() => {
    ipfs = {
      bitswap: {
        wantlist: sinon.stub(),
        wantlistForPeer: sinon.stub(),
        stat: sinon.stub(),
        unwant: sinon.stub()
      },
      bases: {
        getBase: sinon.stub()
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.bitswap.wantlist.withArgs(defaultOptions).returns([
        cid.toV1()
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/wantlist?cid-base=base64'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({ '/': cid.toV1().toString(base64) })
    })

    it('/wantlist?peer=QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base64').returns(base64)
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
      expect(res).to.have.nested.property('result.Wantlist').that.deep.includes({ '/': cid.toV1().toString(base64) })
    })

    it.skip('/stat?cid-base=invalid', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/stat?cid-base=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const res = await http({
        method: 'POST',
        url: `/api/v0/bitswap/unwant?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.bitswap.unwant.calledWith(cid, defaultOptions)).to.be.true()
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const res = await http({
        method: 'POST',
        url: `/api/v0/bitswap/unwant?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(ipfs.bitswap.unwant.calledWith(cid, {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })
})

/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const CID = require('cids')
const sinon = require('sinon')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')

describe('/bitswap', () => {
  const cid = new CID('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR')
  let ipfs

  beforeEach(() => {
    ipfs = {
      bitswap: {
        wantlist: sinon.stub(),
        stat: sinon.stub()
      }
    }
  })

  describe('/wantlist', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/bitswap/wantlist')
    })

    it('/wantlist', async () => {
      ipfs.bitswap.wantlist.returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/wantlist'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({ '/': cid.toString() })
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('/wantlist?cid-base=base64', async () => {
      ipfs.bitswap.wantlist.returns([
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
      ipfs.bitswap.wantlist.returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: '/api/v0/bitswap/wantlist?cid-base=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/stat', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/bitswap/stat')
    })

    it('/stat', async () => {
      ipfs.bitswap.stat.returns({
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

    it('/stat?cid-base=base64', async () => {
      ipfs.bitswap.stat.returns({
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
  })
})

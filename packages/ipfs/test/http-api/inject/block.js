/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const FormData = require('form-data')
const { Buffer } = require('buffer')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const CID = require('cids')

describe('/block', () => {
  const cid = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
  const data = Buffer.from('hello world\n')
  let ipfs

  beforeEach(() => {
    ipfs = {
      block: {
        put: sinon.stub(),
        get: sinon.stub(),
        stat: sinon.stub(),
        rm: sinon.stub()
      }
    }
  })

  describe('/put', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/block/put')
    })

    it('returns 400 if no node is provided', async () => {
      const form = new FormData()
      const headers = form.getHeaders()
      const payload = await streamToPromise(form)

      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('updates value', async () => {
      ipfs.block.put.withArgs(data).returns({
        cid,
        data
      })

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()
      const expectedResult = {
        Key: cid.toString(),
        Size: 12
      }

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', expectedResult)
    })

    it('should put a value and return a base64 encoded CID', async () => {
      ipfs.block.put.withArgs(data).returns({
        cid,
        data
      })

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?cid-base=base64',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Key)).to.equal('base64')
    })

    it('should not put a value for invalid cid-base option', async () => {
      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?cid-base=invalid',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/block/get', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/block/get')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/get'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/get?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.block.get.withArgs(cid).returns({
        cid,
        data
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/get?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result', 'hello world\n')
    })
  })

  describe('/block/stat', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/block/stat')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/stat'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/stat?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.block.stat.withArgs(cid).returns({
        cid,
        size: data.byteLength
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/stat?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result.Key)
        .to.equal(cid.toString())
      expect(res.result.Size).to.equal(12)
    })

    it('should stat a block and return a base64 encoded CID', async () => {
      ipfs.block.stat.withArgs(cid).returns({
        cid,
        size: data.byteLength
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/stat?arg=${cid}&cid-base=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Key)).to.deep.equal('base64')
    })

    it('should not stat a block for invalid cid-base option', async () => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?cid-base=invalid',
        headers,
        payload
      }, { ipfs })
      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/block/rm', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/block/rm')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/rm'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/block/rm?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 200', async () => {
      ipfs.block.rm.withArgs([cid]).returns([{ cid }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/rm?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })
})

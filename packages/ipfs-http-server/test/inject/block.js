/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import FormData from 'form-data'
import streamToPromise from 'stream-to-promise'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import { base32 } from 'multiformats/bases/base32'

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

describe('/block', () => {
  const cid = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
  const data = Buffer.from('hello world\n')
  const expectedResult = {
    Key: cid.toString(),
    Size: 12
  }
  let ipfs

  beforeEach(() => {
    ipfs = {
      block: {
        put: sinon.stub(),
        get: sinon.stub(),
        stat: sinon.stub(),
        rm: sinon.stub()
      },
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  describe('/put', () => {
    const defaultOptions = {
      mhtype: 'sha2-256',
      format: 'dag-pb',
      version: 0,
      pin: false,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.put.withArgs(data, defaultOptions).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put',
        ...await sendData(data)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', expectedResult)
    })

    it('converts a v0 format to dag-pb', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.put.withArgs(data, defaultOptions).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?format=v0',
        ...await sendData(data)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', expectedResult)
    })

    it('updates value and pins block', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.put.withArgs(data, {
        ...defaultOptions,
        pin: true
      }).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?pin=true',
        ...await sendData(data)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', expectedResult)
    })

    it('defaults to base32 encoding with a v1 CID', async () => {
      ipfs.bases.getBase.withArgs('base32').returns(base32)
      ipfs.block.put.withArgs(data, {
        ...defaultOptions,
        version: 1
      }).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?version=1',
        ...await sendData(data)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result.Key).to.equal(cid.toV1().toString())
    })

    it('should put a value and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.block.put.withArgs(data, {
        ...defaultOptions,
        version: 1
      }).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?version=1&cid-base=base64',
        ...await sendData(data)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result.Key).to.equal(cid.toV1().toString(base64))
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.put.withArgs(data, {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/block/put?timeout=1s',
        ...await sendData(data)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/get', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

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
      ipfs.block.get.withArgs(cid, defaultOptions).returns(data)

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/get?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result', 'hello world\n')
    })

    it('accepts a timeout', async () => {
      ipfs.block.get.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(data)

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/get?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/stat', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.stat.withArgs(cid, defaultOptions).returns({
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
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.block.stat.withArgs(cid, defaultOptions).returns({
        cid: cid.toV1(),
        size: data.byteLength
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/stat?arg=${cid}&cid-base=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result.Key).to.equal(cid.toV1().toString(base64))
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.stat.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        cid,
        size: data.byteLength
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/stat?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/rm', () => {
    const defaultOptions = {
      force: false,
      quiet: false,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.rm.withArgs([cid], defaultOptions).returns([{ cid }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/rm?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    it('returns 200 when forcing removal', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.rm.withArgs([cid], {
        ...defaultOptions,
        force: true
      }).returns([{ cid }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/rm?arg=${cid}&force=true`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    it('returns 200 when removing quietly', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.rm.withArgs([cid], {
        ...defaultOptions,
        quiet: true
      }).returns([{ cid }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/rm?arg=${cid}&quiet=true`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    it('returns 200 for multiple CIDs', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const cid2 = CID.parse('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Ka')

      ipfs.block.rm.withArgs([cid, cid2], defaultOptions).returns([{ cid, cid2 }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/rm?arg=${cid}&arg=${cid2}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.block.rm.withArgs([cid], {
        ...defaultOptions,
        timeout: 1000
      }).returns([{ cid }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/block/rm?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })
})

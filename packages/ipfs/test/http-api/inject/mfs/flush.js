/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const http = require('../../../utils/http')
const sinon = require('sinon')
const CID = require('cids')
const cid = new CID('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
const testHttpMethod = require('../../../utils/test-http-method')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/flush', () => {
  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        flush: sinon.stub().resolves(cid)
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/flush?arg=${path}`, ipfs)
  })

  it('should flush a path', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/flush?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Cid', cid.toString())
  })

  it('should flush without a path', async () => {
    const response = await http({
      method: 'POST',
      url: '/api/v0/files/flush'
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.calledWith('/', defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Cid', cid.toString())
  })

  it('should flush with a different CID base', async () => {
    ipfs.files.flush.resolves(cid.toV1())

    const response = await http({
      method: 'POST',
      url: '/api/v0/files/flush?cid-base=base64'
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.calledWith('/', defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Cid', cid.toV1().toString('base64'))
  })

  it('accepts a timeout', async () => {
    const response = await http({
      method: 'POST',
      url: '/api/v0/files/flush?timeout=1s'
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.calledWith('/', {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
    expect(response).to.have.nested.property('result.Cid', cid.toString())
  })
})

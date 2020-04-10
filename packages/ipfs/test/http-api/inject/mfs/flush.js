/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const http = require('../../../utils/http')
const sinon = require('sinon')
const CID = require('cids')
const cid = new CID('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
const testHttpMethod = require('../../../utils/test-http-method')

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
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      path,
      {}
    ])
    expect(response).to.have.nested.property('result.Cid', cid.toString())
  })

  it('should flush without a path', async () => {
    const response = await http({
      method: 'POST',
      url: '/api/v0/files/flush'
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      {}
    ])
    expect(response).to.have.nested.property('result.Cid', cid.toString())
  })

  it('should flush with a different CID base', async () => {
    const response = await http({
      method: 'POST',
      url: '/api/v0/files/flush?cidBase=base64'
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      {}
    ])
    expect(response).to.have.nested.property('result.Cid', cid.toV1().toString('base64'))
  })
})

/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from '../../utils/http.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import { testHttpMethod } from '../../utils/test-http-method.js'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'

const cid = CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')

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
      },
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/flush?arg=${path}`, ipfs)
  })

  it('should flush a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/flush?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Cid', cid.toString())
  })

  it('should flush without a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
    const response = await http({
      method: 'POST',
      url: '/api/v0/files/flush'
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.calledWith('/', defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Cid', cid.toString())
  })

  it('should flush with a different CID base', async () => {
    ipfs.bases.getBase.withArgs('base64').returns(base64)
    ipfs.files.flush.resolves(cid.toV1())

    const response = await http({
      method: 'POST',
      url: '/api/v0/files/flush?cid-base=base64'
    }, { ipfs })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.calledWith('/', defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Cid', cid.toV1().toString(base64))
  })

  it('accepts a timeout', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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

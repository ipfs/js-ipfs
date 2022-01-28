/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'

const defaultOptions = {
  recursive: true,
  cidBase: 'base58btc',
  signal: sinon.match.instanceOf(AbortSignal),
  timeout: undefined
}

describe('/resolve', () => {
  const cid = CID.parse('QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr')
  let ipfs

  beforeEach(() => {
    ipfs = {
      resolve: sinon.stub()
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/resolve')
  })

  it('resolves a name', async () => {
    const result = 'result'
    ipfs.resolve.withArgs(cid.toString(), defaultOptions).returns(result)

    const res = await http({
      method: 'POST',
      url: `/api/v0/resolve?arg=${cid}`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Path', result)
  })

  it('resolves an ipns name', async () => {
    const result = 'result'
    ipfs.resolve.withArgs(`/ipns/${cid}`, defaultOptions).returns(result)

    const res = await http({
      method: 'POST',
      url: `/api/v0/resolve?arg=/ipns/${cid}`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Path', result)
  })

  it('resolves non-recursively', async () => {
    const result = 'result'
    ipfs.resolve.withArgs(cid.toString(), {
      ...defaultOptions,
      recursive: false
    }).returns(result)

    const res = await http({
      method: 'POST',
      url: `/api/v0/resolve?arg=${cid}&recursive=false`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Path', result)
  })

  it('specifies a cid-base', async () => {
    const result = 'result'
    ipfs.resolve.withArgs(cid.toString(), {
      ...defaultOptions,
      cidBase: 'base64'
    }).returns(result)

    const res = await http({
      method: 'POST',
      url: `/api/v0/resolve?arg=${cid}&cid-base=base64`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Path', result)
  })

  it('accepts a timeout', async () => {
    const result = 'result'
    ipfs.resolve.withArgs(cid.toString(), {
      ...defaultOptions,
      timeout: 1000
    }).returns(result)

    const res = await http({
      method: 'POST',
      url: `/api/v0/resolve?arg=${cid}&timeout=1s`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(res).to.have.nested.property('result.Path', result)
  })
})

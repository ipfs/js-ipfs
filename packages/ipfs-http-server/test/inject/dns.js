/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'

const defaultOptions = {
  recursive: false,
  signal: sinon.match.instanceOf(AbortSignal),
  timeout: undefined
}

describe('/dns', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      dns: sinon.stub()
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/dns?arg=ipfs.io')
  })

  it('resolves a domain', async () => {
    const domain = 'ipfs.io'
    ipfs.dns.withArgs(domain, defaultOptions).returns('path')

    const res = await http({
      method: 'POST',
      url: `/api/v0/dns?arg=${domain}`
    }, { ipfs })

    expect(res).to.have.nested.property('result.Path', 'path')
  })

  it('resolves a domain recursively', async () => {
    const domain = 'ipfs.io'
    ipfs.dns.withArgs(domain, {
      ...defaultOptions,
      recursive: true
    }).returns('path')

    const res = await http({
      method: 'POST',
      url: `/api/v0/dns?arg=${domain}&recursive=true`
    }, { ipfs })

    expect(res).to.have.nested.property('result.Path', 'path')
  })

  it('resolves a domain recursively (short option)', async () => {
    const domain = 'ipfs.io'
    ipfs.dns.withArgs(domain, {
      ...defaultOptions,
      recursive: true
    }).returns('path')

    const res = await http({
      method: 'POST',
      url: `/api/v0/dns?arg=${domain}&r=true`
    }, { ipfs })

    expect(res).to.have.nested.property('result.Path', 'path')
  })

  it('accepts a timeout', async () => {
    const domain = 'ipfs.io'
    ipfs.dns.withArgs(domain, {
      ...defaultOptions,
      timeout: 1000
    }).returns('path')

    const res = await http({
      method: 'POST',
      url: `/api/v0/dns?arg=${domain}&timeout=1s`
    }, { ipfs })

    expect(res).to.have.nested.property('result.Path', 'path')
  })
})

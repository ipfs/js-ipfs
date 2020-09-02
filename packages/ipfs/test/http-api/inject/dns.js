/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  recursive: false,
  format: undefined,
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

  it('resolves a domain with a format', async () => {
    const domain = 'ipfs.io'
    ipfs.dns.withArgs(domain, {
      ...defaultOptions,
      format: 'derp'
    }).returns('path')

    const res = await http({
      method: 'POST',
      url: `/api/v0/dns?arg=${domain}&format=derp`
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

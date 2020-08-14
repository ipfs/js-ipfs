/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  signal: sinon.match.instanceOf(AbortSignal),
  timeout: undefined
}

describe('/version', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      version: sinon.stub()
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/version')
  })

  it('get the version', async () => {
    ipfs.version.withArgs(defaultOptions).returns({
      version: 'version',
      commit: 'commit',
      repo: 'repo'
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/version'
    }, { ipfs })

    expect(res).to.have.nested.property('result.Version', 'version')
    expect(res).to.have.nested.property('result.Commit', 'commit')
    expect(res).to.have.nested.property('result.Repo', 'repo')
  })

  it('accepts a timeout', async () => {
    ipfs.version.withArgs({
      ...defaultOptions,
      timeout: 1000
    }).returns({
      version: 'version',
      commit: 'commit',
      repo: 'repo'
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/version?timeout=1s'
    }, { ipfs })

    expect(res).to.have.nested.property('result.Version', 'version')
    expect(res).to.have.nested.property('result.Commit', 'commit')
    expect(res).to.have.nested.property('result.Repo', 'repo')
  })
})

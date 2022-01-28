/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'

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

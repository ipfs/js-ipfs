/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from '../../utils/http.js'
import sinon from 'sinon'
import { testHttpMethod } from '../../utils/test-http-method.js'

const defaultOptions = {
  recursive: false,
  shardSplitThreshold: 1000,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/rm', () => {
  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        rm: sinon.stub().resolves()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/rm?arg=${path}`, ipfs)
  })

  it('should remove a path', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.calledWith([path], defaultOptions)).to.be.true()
  })

  it('should remove a path recursively', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}&recursive=true`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.calledWith([path], {
      ...defaultOptions,
      recursive: true
    })).to.be.true()
  })

  it('should remove a path with a different shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.calledWith([path], {
      ...defaultOptions,
      shardSplitThreshold: 10
    })).to.be.true()
  })

  it('accepts a timeout', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.calledWith([path], {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })
})

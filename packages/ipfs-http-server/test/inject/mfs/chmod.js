/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from '../../utils/http.js'
import sinon from 'sinon'
import { testHttpMethod } from '../../utils/test-http-method.js'

const defaultOptions = {
  recursive: false,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/chmod', () => {
  const path = '/foo'
  const mode = '0654'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        chmod: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/chmod?arg=${path}&mode=${mode}`, ipfs)
  })

  it('should update the mode for a file', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.calledWith(path, mode, defaultOptions)).to.be.true()
  })

  it('should update the mode for a file as a string', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=-x`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.calledWith(path, '-x', defaultOptions)).to.be.true()
  })

  it('should update the mode recursively', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&recursive=true`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.calledWith(path, mode, {
      ...defaultOptions,
      recursive: true
    })).to.be.true()
  })

  it('should update the mode without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&flush=false`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.calledWith(path, mode, {
      ...defaultOptions,
      flush: false
    })).to.be.true()
  })

  it('should update the mode a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.calledWith(path, mode, {
      ...defaultOptions,
      hashAlg: 'sha3-256'
    })).to.be.true()
  })

  it('should update the mode with a shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.calledWith(path, mode, {
      ...defaultOptions,
      shardSplitThreshold: 10
    })).to.be.true()
  })

  it('accepts a timeout', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.calledWith(path, mode, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })
})

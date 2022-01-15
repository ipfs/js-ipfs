/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from '../../utils/http.js'
import sinon from 'sinon'
import { testHttpMethod } from '../../utils/test-http-method.js'

const defaultOptions = {
  parents: false,
  recursive: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/mv', () => {
  const source = '/src'
  const dest = '/dest'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        mv: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/mv?arg=${source}&arg=${dest}`, ipfs)
  })

  it('should move an entry', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, defaultOptions)).to.be.true()
  })

  it('should move an entry and create parents', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&parents=true`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, {
      ...defaultOptions,
      parents: true
    })).to.be.true()
  })

  it('should move an entry recursively', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&recursive=true`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, {
      ...defaultOptions,
      recursive: true
    })).to.be.true()
  })

  it('should make a directory with a different cid version', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&cidVersion=1`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, {
      ...defaultOptions,
      cidVersion: 1
    })).to.be.true()
  })

  it('should make a directory with a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, {
      ...defaultOptions,
      hashAlg: 'sha3-256'
    })).to.be.true()
  })

  it('should make a directory without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&flush=false`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, {
      ...defaultOptions,
      flush: false
    })).to.be.true()
  })

  it('should make a directory a different shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, {
      ...defaultOptions,
      shardSplitThreshold: 10
    })).to.be.true()
  })

  it('accepts a timeout', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.calledWith(source, dest, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })
})

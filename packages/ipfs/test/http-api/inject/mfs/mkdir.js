/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const http = require('../../../utils/http')
const sinon = require('sinon')
const testHttpMethod = require('../../../utils/test-http-method')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  parents: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  mode: undefined,
  mtime: undefined,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/mkdir', () => {
  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        mkdir: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/mkdir?arg=${path}`, ipfs)
  })

  it('should make a directory', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, defaultOptions)).to.be.true()
  })

  it('should make a directory with parents', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&parents=true`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      parents: true
    })).to.be.true()
  })

  it('should make a directory with a different cid version', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&cidVersion=1`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      cidVersion: 1
    })).to.be.true()
  })

  it('should make a directory with a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      hashAlg: 'sha3-256'
    })).to.be.true()
  })

  it('should make a directory without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&flush=false`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      flush: false
    })).to.be.true()
  })

  it('should make a directory a different shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      shardSplitThreshold: 10
    })).to.be.true()
  })

  it('should make a directory a different mode', async () => {
    const mode = '0513'
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&mode=${mode}`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      mode: mode
    })).to.be.true()
  })

  it('should make a directory a different mtime', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&mtime=5`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      mtime: {
        secs: 5
      }
    })).to.be.true()
  })

  it('accepts a timeout', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mkdir?arg=${path}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.calledWith(path, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })
})

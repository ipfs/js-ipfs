/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const http = require('../../../utils/http')
const sinon = require('sinon')
const testHttpMethod = require('../../../utils/test-http-method')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  mtime: undefined,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/touch', () => {
  const path = '/foo'
  const mtime = new Date(1000000)
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        touch: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}`, ipfs)
  })

  it('should update the mtime for a file', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.calledWith(path, defaultOptions)).to.be.true()
  })

  it('should specify the mtime for a file', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.calledWith(path, {
      ...defaultOptions,
      mtime: {
        secs: 1000
      }
    })).to.be.true()
  })

  it('should update the mtime without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&flush=false`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.calledWith(path, {
      ...defaultOptions,
      flush: false
    })).to.be.true()
  })

  it('should update the mtime with a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.calledWith(path, {
      ...defaultOptions,
      hashAlg: 'sha3-256'
    })).to.be.true()
  })

  it('should update the mtime with a shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.calledWith(path, {
      ...defaultOptions,
      shardSplitThreshold: 10
    })).to.be.true()
  })

  it('should update the mtime with nanoseconds', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}&mtimeNsecs=100`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.calledWith(path, {
      ...defaultOptions,
      mtime: {
        secs: 1000,
        nsecs: 100
      }
    })).to.be.true()
  })

  it('accepts a timeout', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.calledWith(path, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })
})

/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const http = require('../../../utils/http')
const sinon = require('sinon')
const testHttpMethod = require('../../../utils/test-http-method')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  cidVersion: 0,
  parents: false,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/cp', () => {
  const source = 'source'
  const dest = 'dest'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        cp: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/cp?arg=${source}&arg=${dest}`, ipfs)
  })

  it('should copy files', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.calledWith(source, dest, defaultOptions)).to.be.true()
  })

  it('should copy files and create intermediate directories', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&parents=true`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.calledWith(source, dest, {
      ...defaultOptions,
      parents: true
    })).to.be.true()
  })

  it('should copy files with a different cid version', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&cidVersion=1`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.calledWith(source, dest, {
      ...defaultOptions,
      cidVersion: 1
    })).to.be.true()
  })

  it('should copy files with a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.calledWith(source, dest, {
      ...defaultOptions,
      hashAlg: 'sha3-256'
    })).to.be.true()
  })

  it('should copy files with a different shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.calledWith(source, dest, {
      ...defaultOptions,
      shardSplitThreshold: 10
    })).to.be.true()
  })

  it('accepts a timeout', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.calledWith(source, dest, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })
})

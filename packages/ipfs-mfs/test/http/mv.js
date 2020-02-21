/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const http = require('../helpers/http')
const sinon = require('sinon')

function defaultOptions (modification = {}) {
  const options = {
    parents: false,
    recursive: false,
    cidVersion: 0,
    hashAlg: 'sha2-256',
    flush: true,
    shardSplitThreshold: 1000
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
}

describe('mv', () => {
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

  it('should move an entry', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions()
    ])
  })

  it('should move an entry and create parents', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&parents=true`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        parents: true
      })
    ])
  })

  it('should move an entry recursively', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&recursive=true`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        recursive: true
      })
    ])
  })

  it('should make a directory with a different cid version', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&cidVersion=1`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        cidVersion: 1
      })
    ])
  })

  it('should make a directory with a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should make a directory without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&flush=false`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        flush: false
      })
    ])
  })

  it('should make a directory a different shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/mv?arg=${source}&arg=${dest}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        shardSplitThreshold: 10
      })
    ])
  })
})

/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const http = require('../../../utils/http')
const sinon = require('sinon')

function defaultOptions (modification = {}) {
  const options = {
    cidVersion: 0,
    parents: false,
    hashAlg: 'sha2-256',
    flush: true,
    shardSplitThreshold: 1000
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
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

  it('only accepts POST', async () => {
    const res = await http({
      method: 'GET',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}`
    }, { ipfs })

    expect(res.statusCode).to.equal(404)
  })

  it('should copy files', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions()
    ])
  })

  it('should copy files and create intermediate directories', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&parents=true`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        parents: true
      })
    ])
  })

  it('should copy files with a different cid version', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&cidVersion=1`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        cidVersion: 1
      })
    ])
  })

  it('should copy files with a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should copy files with a different shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/cp?arg=${source}&arg=${dest}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions({
        shardSplitThreshold: 10
      })
    ])
  })
})

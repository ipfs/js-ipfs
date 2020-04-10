/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const http = require('../../../utils/http')
const sinon = require('sinon')
const testHttpMethod = require('../../../utils/test-http-method')

function defaultOptions (modification = {}) {
  const options = {
    recursive: false,
    shardSplitThreshold: 1000
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
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
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path,
      defaultOptions()
    ])
  })

  it('should remove a path recursively', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}&recursive=true`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        recursive: true
      })
    ])
  })

  it('should remove a path with a different shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/rm?arg=${path}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.rm.callCount).to.equal(1)
    expect(ipfs.files.rm.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        shardSplitThreshold: 10
      })
    ])
  })
})

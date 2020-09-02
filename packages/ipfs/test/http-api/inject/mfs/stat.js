/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const http = require('../../../utils/http')
const sinon = require('sinon')
const CID = require('cids')
const fileCid = new CID('bafybeigyov3nzxrqjismjpq7ghkkjorcmozy5rgaikvyieakoqpxfc3rvu')
const testHttpMethod = require('../../../utils/test-http-method')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  withLocal: false,
  hash: false,
  size: false,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/stat', () => {
  const path = '/foo'
  const stats = {
    cid: fileCid,
    size: 'stats-size',
    cumulativeSize: 'stats-cumulativeSize',
    blocks: 'stats-blocks',
    type: 'stats-type',
    mode: 'stats-mode',
    mtime: 'stats-mtime'
  }
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        stat: sinon.stub().resolves(stats)
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/stat?arg=${path}`, ipfs)
  })

  it('should stat a path', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.CumulativeSize', stats.cumulativeSize)
  })

  it('should stat a path with local', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&withLocal=true`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, {
      ...defaultOptions,
      withLocal: true
    })).to.be.true()
  })

  it('should stat a path and only show hashes', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&hash=true`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, {
      ...defaultOptions,
      hash: true
    })).to.be.true()
    expect(response).to.have.nested.property('result.Hash', stats.cid.toString())
  })

  it('should stat a path and only show sizes', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&size=true`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, {
      ...defaultOptions,
      size: true
    })).to.be.true()
    expect(response).to.have.nested.property('result.Size', stats.size)
  })

  it('should stat a path and show hashes with a different base', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&cidBase=base64`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Hash', stats.cid.toString('base64'))
  })

  it('accepts a timeout', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
    expect(response).to.have.nested.property('result.Size', stats.size)
  })
})

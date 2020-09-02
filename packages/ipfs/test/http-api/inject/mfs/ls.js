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
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/ls', () => {
  const path = '/foo'
  const file = {
    name: 'file-name',
    type: 'file-type',
    size: 'file-size',
    cid: fileCid,
    mode: 'file-mode',
    mtime: {
      secs: 'file-mtime-secs',
      nsecs: 'file-mtime-nsecs'
    }
  }
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        ls: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/ls?arg=${path}`, ipfs)
  })

  it('should list a path', async () => {
    ipfs.files.ls.withArgs(path, defaultOptions).returns([file])

    const response = await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Entries.length', 1)
    expect(response).to.have.nested.property('result.Entries[0].Name', file.name)
    expect(response).to.have.nested.property('result.Entries[0].Type', 0)
    expect(response).to.have.nested.property('result.Entries[0].Size', 0)
    expect(response).to.have.nested.property('result.Entries[0].Hash', file.cid.toString())
  })

  it('should list without a path', async () => {
    ipfs.files.ls.withArgs('/', defaultOptions).returns([file])

    await http({
      method: 'POST',
      url: '/api/v0/files/ls'
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.calledWith('/', defaultOptions)).to.be.true()
  })

  it('should list a path with details', async () => {
    ipfs.files.ls.withArgs(path, defaultOptions).returns([file])

    const response = await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}&long=true`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.calledWith(path, defaultOptions)).to.be.true()

    expect(response).to.have.nested.property('result.Entries.length', 1)
    expect(response).to.have.nested.property('result.Entries[0].Name', file.name)
    expect(response).to.have.nested.property('result.Entries[0].Type', file.type)
    expect(response).to.have.nested.property('result.Entries[0].Size', file.size)
    expect(response).to.have.nested.property('result.Entries[0].Hash', file.cid.toString())
    expect(response).to.have.nested.property('result.Entries[0].Mode', file.mode)
    expect(response).to.have.nested.property('result.Entries[0].Mtime', file.mtime.secs)
    expect(response).to.have.nested.property('result.Entries[0].MtimeNsecs', file.mtime.nsecs)
  })

  it('should stream a path', async () => {
    ipfs.files.ls.withArgs(path, defaultOptions).returns([file])

    await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}&stream=true`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.calledWith(path, defaultOptions)).to.be.true()
  })

  it('accepts a timeout', async () => {
    ipfs.files.ls.withArgs({
      ...defaultOptions,
      timeout: 1000
    }).returns([file])

    await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.calledWith(path, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })

  it('accepts a timeout when streaming', async () => {
    ipfs.files.ls.withArgs({
      ...defaultOptions,
      timeout: 1000
    }).returns([file])

    await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}&stream=true&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.calledWith(path, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
  })
})

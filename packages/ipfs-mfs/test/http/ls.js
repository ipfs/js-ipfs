/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const http = require('../helpers/http')
const sinon = require('sinon')
const CID = require('cids')
const fileCid = new CID('bafybeigyov3nzxrqjismjpq7ghkkjorcmozy5rgaikvyieakoqpxfc3rvu')

describe('ls', () => {
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
        ls: sinon.stub().returns([])
      }
    }
  })

  it('should list a path', async () => {
    ipfs.files.ls = sinon.stub().returns([file])

    const response = await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      path
    ])
    expect(response).to.have.nested.property('result.Entries.length', 1)
    expect(response).to.have.nested.property('result.Entries[0].Name', file.name)
    expect(response).to.have.nested.property('result.Entries[0].Type', 0)
    expect(response).to.have.nested.property('result.Entries[0].Size', 0)
    expect(response).to.have.nested.property('result.Entries[0].Hash', file.cid.toString())
  })

  it('should list without a path', async () => {
    await http({
      method: 'POST',
      url: '/api/v0/files/ls'
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      '/'
    ])
  })

  it('should list a path with details', async () => {
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
    ipfs.files.ls = sinon.stub().returns([file])

    const response = await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}&long=true`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      path
    ])

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
    ipfs.files.ls = sinon.stub().returns([file])
    await http({
      method: 'POST',
      url: `/api/v0/files/ls?arg=${path}&stream=true`
    }, { ipfs })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      path
    ])
  })
})

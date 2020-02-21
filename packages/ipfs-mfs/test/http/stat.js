/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const http = require('../helpers/http')
const sinon = require('sinon')
const CID = require('cids')
const fileCid = new CID('bafybeigyov3nzxrqjismjpq7ghkkjorcmozy5rgaikvyieakoqpxfc3rvu')

function defaultOptions (modification = {}) {
  const options = {
    withLocal: false,
    hash: false,
    size: false
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
}

describe('stat', () => {
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

  it('should stat a path', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions()
    ])
    expect(response).to.have.nested.property('result.CumulativeSize', stats.cumulativeSize)
  })

  it('should stat a path with local', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&withLocal=true`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        withLocal: true
      })
    ])
  })

  it('should stat a path and only show hashes', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&hash=true`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        hash: true
      })
    ])
    expect(response).to.have.nested.property('result.Hash', stats.cid.toString())
  })

  it('should stat a path and only show sizes', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&size=true`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        size: true
      })
    ])
    expect(response).to.have.nested.property('result.Size', stats.size)
  })

  it('should stat a path and show hashes with a different base', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&cidBase=base64`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.getCall(0).args).to.deep.equal([
      path,
      defaultOptions()
    ])
    expect(response).to.have.nested.property('result.Hash', stats.cid.toString('base64'))
  })
})

/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from '../../utils/http.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import { testHttpMethod } from '../../utils/test-http-method.js'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'

const fileCid = CID.parse('bafybeigyov3nzxrqjismjpq7ghkkjorcmozy5rgaikvyieakoqpxfc3rvu')

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
      },
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/stat?arg=${path}`, ipfs)
  })

  it('should stat a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.CumulativeSize', stats.cumulativeSize)
  })

  it('should stat a path with local', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&hash=true`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, {
      ...defaultOptions,
      hash: true
    })).to.be.true()
    expect(response).to.have.nested.property('result.Hash', stats.cid.toString(base58btc))
  })

  it('should stat a path and only show sizes', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
    ipfs.bases.getBase.withArgs('base64').returns(base64)
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/stat?arg=${path}&cidBase=base64`
    }, { ipfs })

    expect(ipfs.files.stat.callCount).to.equal(1)
    expect(ipfs.files.stat.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.nested.property('result.Hash', stats.cid.toString(base64))
  })

  it('accepts a timeout', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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

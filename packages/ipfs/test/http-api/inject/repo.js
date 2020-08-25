/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const CID = require('cids')
const { AbortSignal } = require('abort-controller')
const allNdjson = require('../../utils/all-ndjson')

describe('/repo', () => {
  const cid = new CID('QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr')
  const cid2 = new CID('QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgda')
  let ipfs

  beforeEach(() => {
    ipfs = {
      repo: {
        gc: sinon.stub(),
        version: sinon.stub(),
        stat: sinon.stub()
      }
    }
  })

  describe('/gc', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/repo/gc')
    })

    it('should run gc', async () => {
      ipfs.repo.gc.withArgs(defaultOptions).returns([{
        cid: cid
      }, {
        cid: cid2
      }, {
        err: new Error('Derp')
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/repo/gc'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([
        { Key: { '/': cid.toString() } },
        { Key: { '/': cid2.toString() } }
      ])
    })

    it('should run gc and stream errors', async () => {
      ipfs.repo.gc.withArgs(defaultOptions).returns([{
        cid: cid
      }, {
        cid: cid2
      }, {
        err: new Error('Derp')
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/repo/gc?stream-errors=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([
        { Key: { '/': cid.toString() } },
        { Key: { '/': cid2.toString() } },
        { Error: 'Derp' }
      ])
    })

    it('accepts a timeout', async () => {
      ipfs.repo.gc.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        cid: cid
      }, {
        cid: cid2
      }, {
        err: new Error('Derp')
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/repo/gc?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([
        { Key: { '/': cid.toString() } },
        { Key: { '/': cid2.toString() } }
      ])
    })
  })

  describe('/version', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/repo/version')
    })

    it('returns the version', async () => {
      ipfs.repo.version.withArgs(defaultOptions).returns(5)

      const res = await http({
        method: 'POST',
        url: '/api/v0/repo/version'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Version', 5)
    })

    it('accepts a timeout', async () => {
      ipfs.repo.version.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns(5)

      const res = await http({
        method: 'POST',
        url: '/api/v0/repo/version?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Version', 5)
    })
  })

  describe('/stat', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/repo/stat')
    })

    it('returns repo stats', async () => {
      ipfs.repo.stat.withArgs(defaultOptions).returns({
        numObjects: 'numObjects',
        repoSize: 'repoSize',
        repoPath: 'repoPath',
        version: 'version',
        storageMax: 'storageMax'
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/repo/stat'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.NumObjects', 'numObjects')
      expect(res).to.have.nested.property('result.RepoSize', 'repoSize')
      expect(res).to.have.nested.property('result.RepoPath', 'repoPath')
      expect(res).to.have.nested.property('result.Version', 'version')
      expect(res).to.have.nested.property('result.StorageMax', 'storageMax')
    })

    it('accepts a timeout', async () => {
      ipfs.repo.stat.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns({
        numObjects: 'numObjects',
        repoSize: 'repoSize',
        repoPath: 'repoPath',
        version: 'version',
        storageMax: 'storageMax'
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/repo/stat?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.NumObjects', 'numObjects')
      expect(res).to.have.nested.property('result.RepoSize', 'repoSize')
      expect(res).to.have.nested.property('result.RepoPath', 'repoPath')
      expect(res).to.have.nested.property('result.Version', 'version')
      expect(res).to.have.nested.property('result.StorageMax', 'storageMax')
    })
  })
})

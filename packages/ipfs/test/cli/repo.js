/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')
const BigNumber = require('bignumber.js')
const CID = require('cids')

describe('repo', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      repo: {
        stat: sinon.stub(),
        version: sinon.stub(),
        gc: sinon.stub()
      }
    }
  })

  describe('stat', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('get repo stats', async () => {
      ipfs.repo.stat.withArgs(defaultOptions).resolves({
        numObjects: BigNumber(10),
        repoSize: BigNumber(10),
        storageMax: BigNumber(10),
        repoPath: '/foo',
        version: 5
      })

      const stats = await cli('repo stat', { ipfs })
      expect(stats).to.match(/^NumObjects:\s+\d+$/m)
      expect(stats).to.match(/^RepoSize:\s+\d+$/m)
      expect(stats).to.match(/^StorageMax:\s+\d+$/m)
      expect(stats).to.match(/^RepoPath:\s.+$/m)
      expect(stats).to.match(/^Version:\s+\d+$/m)
    })

    it('get repo stats with just size', async () => {
      ipfs.repo.stat.withArgs(defaultOptions).resolves({
        numObjects: BigNumber(10),
        repoSize: BigNumber(10),
        storageMax: BigNumber(10),
        repoPath: '/foo',
        version: 5
      })

      const stats = await cli('repo stat -s', { ipfs })
      expect(stats).to.not.match(/^NumObjects:$/m)
      expect(stats).to.match(/^RepoSize:\s+\d+$/m)
      expect(stats).to.match(/^StorageMax:\s+\d+$/m)
      expect(stats).to.not.match(/^RepoPath:$/m)
      expect(stats).to.not.match(/^Version:$/m)
    })

    it('get human readable repo stats', async () => {
      ipfs.repo.stat.withArgs(defaultOptions).resolves({
        numObjects: BigNumber(10),
        repoSize: BigNumber(10),
        storageMax: BigNumber(10),
        repoPath: '/foo',
        version: 5
      })

      const stats = await cli('repo stat --human', { ipfs })
      expect(stats).to.match(/^NumObjects:\s+\d+$/m)
      expect(stats).to.match(/^RepoSize:\s+[\d.]+\s[PTGMK]?B$/gm)
      expect(stats).to.match(/^StorageMax:\s+[\d.]+\s[PTGMK]?B$/gm)
      expect(stats).to.match(/^RepoPath:\s.+$/m)
      expect(stats).to.match(/^Version:\s+\d+$/m)
    })

    it('get repo with timeout', async () => {
      ipfs.repo.stat.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        numObjects: BigNumber(10),
        repoSize: BigNumber(10),
        storageMax: BigNumber(10),
        repoPath: '/foo',
        version: 5
      })

      const stats = await cli('repo stat --timeout=1s', { ipfs })
      expect(stats).to.match(/^NumObjects:\s+\d+$/m)
      expect(stats).to.match(/^RepoSize:\s+\d+$/m)
      expect(stats).to.match(/^StorageMax:\s+\d+$/m)
      expect(stats).to.match(/^RepoPath:\s.+$/m)
      expect(stats).to.match(/^Version:\s+\d+$/m)
    })
  })

  describe('version', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('get the repo version', async () => {
      const repoVersion = 5

      ipfs.repo.version.withArgs(defaultOptions).resolves(repoVersion)

      const out = await cli('repo version', { ipfs })
      expect(out).to.eql(`${repoVersion}\n`)
    })

    it('get the repo version with timeout', async () => {
      const repoVersion = 5

      ipfs.repo.version.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves(repoVersion)

      const out = await cli('repo version --timeout=1s', { ipfs })
      expect(out).to.eql(`${repoVersion}\n`)
    })
  })

  describe('gc', () => {
    const cid = new CID('Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u')
    const defaultOptions = {
      timeout: undefined
    }

    it('gc with no flags prints errors and outputs hashes', async () => {
      ipfs.repo.gc.withArgs(defaultOptions).returns([{
        err: new Error('err')
      }, {
        cid
      }])

      const out = await cli('repo gc', { ipfs })
      expect(out).to.equal(`err\nremoved ${cid.toString()}\n`)
    })

    it('gc with --quiet prints hashes only', async () => {
      ipfs.repo.gc.withArgs(defaultOptions).returns([{
        err: new Error('err')
      }, {
        cid
      }])

      const out = await cli('repo gc --quiet', { ipfs })
      expect(out).to.equal(`err\n${cid.toString()}\n`)
    })

    it('gc with -q prints hashes only', async () => {
      ipfs.repo.gc.withArgs(defaultOptions).returns([{
        err: new Error('err')
      }, {
        cid
      }])

      const out = await cli('repo gc -q', { ipfs })
      expect(out).to.equal(`err\n${cid.toString()}\n`)
    })

    it('gc with --stream-errors=false does not print errors', async () => {
      ipfs.repo.gc.withArgs(defaultOptions).returns([{
        err: new Error('err')
      }, {
        cid
      }])

      const out = await cli('repo gc --stream-errors=false', { ipfs })
      expect(out).to.equal(`removed ${cid.toString()}\n`)
    })

    it('should run gc with timeout', async () => {
      ipfs.repo.gc.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        err: new Error('err')
      }, {
        cid
      }])

      const out = await cli('repo gc --timeout=1s', { ipfs })
      expect(out).to.equal(`err\nremoved ${cid.toString()}\n`)
    })
  })
})

/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const clean = require('../utils/clean')
const ipfsExec = require('../utils/ipfs-exec')
const os = require('os')

describe('init', () => {
  let repoPath
  let ipfs

  const repoExistsSync = (p) => fs.existsSync(path.join(repoPath, p))

  beforeEach(() => {
    repoPath = os.tmpdir() + '/ipfs-' + Math.random().toString().substring(2, 8)
    ipfs = ipfsExec(repoPath)
  })

  afterEach(() => clean(repoPath))

  it('basic', () => {
    return ipfs('init').then(() => {
      expect(repoExistsSync('blocks')).to.equal(true)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })

  it('bits', () => {
    return ipfs('init --bits 1024').then(() => {
      expect(repoExistsSync('blocks')).to.equal(true)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })

  it('empty', () => {
    return ipfs('init --bits 1024 --empty-repo true').then(() => {
      expect(repoExistsSync('blocks')).to.equal(false)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })
})

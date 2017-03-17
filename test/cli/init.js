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

  const repoDirSync = (p) => {
    return fs.readdirSync(path.join(repoPath, p)).filter((f) => {
      return !f.startsWith('.')
    })
  }
  beforeEach(() => {
    repoPath = os.tmpdir() + '/ipfs-' + Math.random().toString().substring(2, 8)
    ipfs = ipfsExec(repoPath)
  })

  afterEach(() => clean(repoPath))

  it('basic', () => {
    return ipfs('init').then(() => {
      expect(repoDirSync('blocks')).to.have.length.above(2)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })

  it('bits', () => {
    return ipfs('init --bits 1024').then(() => {
      expect(repoDirSync('blocks')).to.have.length.above(2)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })

  it('empty', () => {
    return ipfs('init --bits 1024 --empty-repo true').then(() => {
      expect(repoDirSync('blocks')).to.have.length(2)
      expect(repoExistsSync('config')).to.equal(true)
      expect(repoExistsSync('version')).to.equal(true)
    })
  })
})

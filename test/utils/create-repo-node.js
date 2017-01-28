'use strict'

const IPFSRepo = require('ipfs-repo')
const Store = require('fs-pull-blob-store')
const clean = require('./clean')

function createTempRepo (repoPath) {
  repoPath = repoPath || '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8)

  const repo = new IPFSRepo(repoPath, {
    bits: 1024,
    stores: Store
  })

  repo.teardown = (done) => {
    clean(repoPath)
    setImmediate(() => done())
  }

  return repo
}

module.exports = createTempRepo

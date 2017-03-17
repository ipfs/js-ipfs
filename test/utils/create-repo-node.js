'use strict'

const IPFSRepo = require('ipfs-repo')
const clean = require('./clean')
const series = require('async/series')

function createTempRepo (repoPath) {
  repoPath = repoPath || '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8)

  const repo = new IPFSRepo(repoPath)

  repo.teardown = (done) => {
    series([
      // ignore err, might have been closed already
      (cb) => repo.close(() => cb()),
      (cb) => {
        clean(repoPath)
        cb()
      }
    ], done)
  }

  return repo
}

module.exports = createTempRepo

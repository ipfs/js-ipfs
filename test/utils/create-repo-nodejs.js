'use strict'

const IPFSRepo = require('ipfs-repo')
const clean = require('./clean')
const os = require('os')
const path = require('path')
const hat = require('hat')
const series = require('async/series')

function createTempRepo (repoPath) {
  repoPath = repoPath || path.join(os.tmpdir(), '/ipfs-test-' + hat())

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

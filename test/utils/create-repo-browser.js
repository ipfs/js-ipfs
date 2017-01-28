'use strict'

const IPFSRepo = require('ipfs-repo')
const Store = require('idb-pull-blob-store')

const idb = window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB

function createTempRepo (repoPath) {
  repoPath = repoPath || '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8)

  const repo = new IPFSRepo(repoPath, {
    bits: 1024,
    stores: Store
  })

  repo.teardown = (done) => {
    idb.deleteDatabase(repoPath)
    idb.deleteDatabase(repoPath + '/blocks')
    done()
  }

  return repo
}

module.exports = createTempRepo

/* eslint-env mocha */
'use strict'

const IPFSRepo = require('ipfs-repo')
const clean = require('./clean')

function createTempRepo () {
  const repoPath = '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8)
  let store
  let teardown

  const isNode = require('detect-node')
  if (isNode) {
    store = require('fs-pull-blob-store')
    teardown = (done) => {
      clean(repoPath)
      done()
    }
  } else {
    const idb = window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB
    store = require('idb-pull-blob-store')
    teardown = (done) => {
      idb.deleteDatabase(repoPath)
      idb.deleteDatabase(repoPath + '/blocks')
      done()
    }
  }

  var repo = new IPFSRepo(repoPath, {
    bits: 1024,
    stores: store
  })

  repo.teardown = teardown

  return repo
}

module.exports = createTempRepo

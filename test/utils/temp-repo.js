/* eslint-env mocha */
'use strict'

const IPFSRepo = require('ipfs-repo')
const clean = require('./clean')
const isNode = require('detect-node')

function createTempRepo () {
  const repoPath = '/tmp/ipfs-test-' + Math.random().toString().substring(2, 10)

  let store
  let teardown

  if (isNode) {
    store = require('fs-blob-store')
    teardown = (done) => {
      clean(repoPath)
      done()
    }
  } else {
    const idb = window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB
    store = require('idb-plus-blob-store')
    teardown = (done) => {
      idb.deleteDatabase(repoPath)
      idb.deleteDatabase(repoPath + '/blocks')
      done()
    }
  }

  var repo = new IPFSRepo(repoPath, {
    bits: 64,
    stores: store
  })

  repo.teardown = teardown
  repo.path = repoPath
  return repo
}

module.exports = createTempRepo

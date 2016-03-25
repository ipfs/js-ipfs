/* eslint-env mocha */

const expect = require('chai').expect
const IPFSRepo = require('ipfs-repo')

function createTempRepo () {
  const repoPath = '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8) + '/'

  var store
  var teardown

  const isNode = !global.window
  if (isNode) {
    store = require('fs-blob-store')
    teardown = (done) => {
      const rimraf = require('rimraf')
      rimraf(repoPath, (err) => {
        expect(err).to.not.exist
        done()
      })
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

  const options = {
    bits: 64,
    stores: {
      keys: store,
      config: store,
      datastore: store,
      logs: store,
      locks: store,
      version: store
    }
  }

  var repo = new IPFSRepo(repoPath, options)

  repo.teardown = teardown

  return repo
}

module.exports = createTempRepo

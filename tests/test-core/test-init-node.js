/* eslint-env mocha */

const expect = require('chai').expect
const IPFS = require('../../src/core')
const IPFSRepo = require('ipfs-repo')

function createTestRepo () {
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

describe('node: init', function () {
  this.timeout(10000)

  it('init docs written', (done) => {
    var repo = createTestRepo()
    const ipfs = new IPFS(repo)
    ipfs.init({ bits: 64 }, (err) => {
      expect(err).to.not.exist

      // Check for default assets
      var multihash = new Buffer('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')
      ipfs.object.get(multihash, {}, (err, node) => {
        expect(err).to.not.exist
        expect(node.links).to.exist

        repo.teardown(done)
      })
    })
  })

  it('empty repo', (done) => {
    var repo = createTestRepo()
    const ipfs = new IPFS(repo)
    ipfs.init({ bits: 64, emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      // Check for default assets
      var multihash = new Buffer('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')
      ipfs.object.get(multihash, {}, (err, node) => {
        expect(err).to.exist
        repo.teardown(done)
      })
    })
  })
})

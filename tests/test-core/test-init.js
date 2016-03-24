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

describe('init', function () {
  this.timeout(10000)

  it('basic', (done) => {
    var repo = createTestRepo()
    const ipfs = new IPFS(repo)
    ipfs.init({ emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      repo.exists((err, res) => {
        expect(err).to.not.exist
        expect(res).to.equal(true)

        repo.config.get((err, config) => {
          expect(err).to.not.exist
          expect(config.Identity).to.exist

          repo.teardown(done)
        })
      })
    })
  })

  it('set # of bits in key', (done) => {
    var repo1 = createTestRepo()
    var repo2 = createTestRepo()
    const ipfsShort = new IPFS(repo1)
    const ipfsLong = new IPFS(repo2)
    ipfsShort.init({ bits: 128, emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      ipfsLong.init({ bits: 256, emptyRepo: true }, (err) => {
        expect(err).to.not.exist

        repo1.config.get((err, config1) => {
          expect(err).to.not.exist

          repo2.config.get((err, config2) => {
            expect(err).to.not.exist
            expect(config1.Identity.PrivKey.length).is.below(config2.Identity.PrivKey.length)

            repo1.teardown(() => {
              repo2.teardown(done)
            })
          })
        })
      })
    })
  })

  it('force init (overwrite)', (done) => {
    var repo = createTestRepo()
    const ipfs1 = new IPFS(repo)
    const ipfs2 = new IPFS(repo)
    ipfs1.init({ bits: 128, emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      ipfs2.init({ bits: 128, force: false }, (err) => {
        expect(err).to.exist

        ipfs2.init({ force: true }, (err) => {
          expect(err).to.not.exist

          repo.teardown(done)
        })
      })
    })
  })
})

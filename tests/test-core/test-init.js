/* eslint-env mocha */

const expect = require('chai').expect
const IPFS = require('../../src/core')
const createTempRepo = require('../temp-repo')

describe('init', function () {
  this.timeout(10000)

  it('basic', (done) => {
    var repo = createTempRepo()
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
    var repo1 = createTempRepo()
    var repo2 = createTempRepo()
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
    var repo = createTempRepo()
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

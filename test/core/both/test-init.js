/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const IPFS = require('../../../src/core')
const createTempRepo = require('../../utils/temp-repo')

describe('init', function () {
  this.timeout(50 * 1000)

  it('basic', (done) => {
    const repo = createTempRepo()
    const ipfs = new IPFS(repo)

    ipfs.init({ emptyRepo: true, bits: 1024 }, (err) => {
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
    const repo1 = createTempRepo()
    const repo2 = createTempRepo()
    const ipfsShort = new IPFS(repo1)
    const ipfsLong = new IPFS(repo2)
    ipfsShort.init({ bits: 1024, emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      ipfsLong.init({ bits: 2048, emptyRepo: true }, (err) => {
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
})

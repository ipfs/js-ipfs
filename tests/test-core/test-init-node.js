/* eslint-env mocha */

const expect = require('chai').expect
const IPFS = require('../../src/core')
const createTempRepo = require('../temp-repo')

describe('node: init', function () {
  this.timeout(10000)

  it('init docs written', (done) => {
    var repo = createTempRepo()
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
    var repo = createTempRepo()
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

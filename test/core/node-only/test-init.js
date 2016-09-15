/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const IPFS = require('../../../src/core')
const createTempRepo = require('../../utils/temp-repo')

describe('init (Node.js specific)', function () {
  this.timeout(10000)

  var ipfs
  var repo

  beforeEach((done) => {
    repo = createTempRepo()
    ipfs = new IPFS(repo)
    done()
  })

  afterEach((done) => {
    repo.teardown(done)
  })

  it('init docs are written', (done) => {
    ipfs.init({ bits: 512 }, (err) => {
      expect(err).to.not.exist
      var multihash = new Buffer('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')
      setTimeout(() => {
        ipfs.object.get(multihash, {}, (err, node) => {
          expect(err).to.not.exist
          expect(node.links).to.exist
          done()
        })
      }, 1000)
    })
  })

  it('empty repo', (done) => {
    ipfs.init({ bits: 512, emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      // Check for default assets
      var multihash = new Buffer('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')
      ipfs.object.get(multihash, {}, (err, node) => {
        expect(err).to.exist
        done()
      })
    })
  })
})

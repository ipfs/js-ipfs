/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const IPFS = require('../../src/core')

// This gets replaced by require('../utils/create-repo-browser.js')
// in the browser
const createTempRepo = require('../utils/create-repo-node.js')

describe('init', () => {
  if (!isNode) { return }

  let ipfs
  let repo

  beforeEach(() => {
    repo = createTempRepo()
    ipfs = new IPFS({
      repo: repo,
      EXPERIMENTAL: {
        pubsub: true
      }
    })
  })

  afterEach((done) => repo.teardown(done))

  it('basic', (done) => {
    ipfs.init({ bits: 1024 }, (err) => {
      expect(err).to.not.exist

      repo.exists((err, res) => {
        expect(err).to.not.exist
        expect(res).to.equal(true)

        repo.config.get((err, config) => {
          expect(err).to.not.exist
          expect(config.Identity).to.exist
          done()
        })
      })
    })
  })

  it('set # of bits in key', (done) => {
    ipfs.init({ bits: 2048 }, (err) => {
      expect(err).to.not.exist

      repo.config.get((err, config) => {
        expect(err).to.not.exist
        expect(config.Identity.PrivKey.length).is.above(256)
        done()
      })
    })
  })

  it('init docs are written', (done) => {
    ipfs.init({ bits: 1024 }, (err) => {
      expect(err).to.not.exist
      const multihash = new Buffer('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')

      ipfs.object.get(multihash, {}, (err, node) => {
        expect(err).to.not.exist
        expect(node.links).to.exist
        done()
      })
    })
  })

  it('empty repo', (done) => {
    ipfs.init({ bits: 1024, emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      // Should not have default assets
      const multihash = new Buffer('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')

      ipfs.object.get(multihash, {}, (err, node) => {
        expect(err).to.exist
        done()
      })
    })
  })
})

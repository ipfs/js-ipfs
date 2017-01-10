/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const IPFS = require('../../../src/core')
const createTempRepo = require('../../utils/temp-repo')

describe('init (Node.js specific)', () => {
  let ipfs
  let repo

  beforeEach((done) => {
    repo = createTempRepo()
    ipfs = new IPFS(repo)
    done()
  })

  afterEach((done) => {
    repo.teardown(done)
  })

  it('init docs are written', (done) => {
    ipfs.init({ bits: 1024 }, (err) => {
      expect(err).to.not.exist
      const multihash = new Buffer('12209fc9ba7a2c3de39e9460e76ee392b460fb404a22b7e24d95f3c90bfeb3c24290', 'hex')

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
    ipfs.init({ bits: 1024, emptyRepo: true }, (err) => {
      expect(err).to.not.exist

      // Check for default assets
      var multihash = new Buffer('12209fc9ba7a2c3de39e9460e76ee392b460fb404a22b7e24d95f3c90bfeb3c24290', 'hex')
      ipfs.object.get(multihash, {}, (err, node) => {
        expect(err).to.exist
        done()
      })
    })
  })
})

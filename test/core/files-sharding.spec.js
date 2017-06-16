/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const pull = require('pull-stream')
const Buffer = require('safe-buffer').Buffer

const IPFS = require('../../src/core')
const createTempRepo = require('../utils/create-repo-node.js')

describe('files dir', () => {
  const files = []
  for (let i = 0; i < 1005; i++) {
    files.push({
      path: 'test-folder/' + i,
      content: Buffer.from('some content ' + i)
    })
  }

  describe('without sharding', () => {
    let ipfs

    before((done) => {
      ipfs = new IPFS({
        repo: createTempRepo(),
        config: {
          Addresses: {
            Swarm: []
          },
          Bootstrap: []
        }
      })
      ipfs.once('start', done)
    })

    after((done) => ipfs.stop(done))

    it('should be able to add dir without sharding', (done) => {
      pull(
        pull.values(files),
        ipfs.files.createAddPullStream(),
        pull.collect((err, results) => {
          expect(err).to.not.exist()
          const last = results[results.length - 1]
          expect(last.path).to.be.eql('test-folder')
          expect(last.hash).to.be.eql('QmWWM8ZV6GPhqJ46WtKcUaBPNHN5yQaFsKDSQ1RE73w94Q')
          done()
        })
      )

      after((done) => {
        ipfs.stop(() => done()) // ignore stop errors
      })
    })
  })

  describe('with sharding', () => {
    let ipfs

    before((done) => {
      ipfs = new IPFS({
        repo: createTempRepo(),
        config: {
          Addresses: {
            Swarm: []
          },
          Bootstrap: []
        },
        EXPERIMENTAL: {
          sharding: true
        }
      })
      ipfs.once('start', done)
    })

    after((done) => {
      ipfs.stop(() => done()) // ignore stop errors
    })

    it('should be able to add dir with sharding', (done) => {
      pull(
        pull.values(files),
        ipfs.files.createAddPullStream(),
        pull.collect((err, results) => {
          expect(err).to.not.exist()
          const last = results[results.length - 1]
          expect(last.path).to.be.eql('test-folder')
          expect(last.hash).to.be.eql('QmY8TxNWtNViN7syd2DHazPqu21qWfSNjzCDe78e4YMsUD')
          done()
        })
      )
    })
  })
})

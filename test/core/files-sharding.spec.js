'use strict'

const expect = require('chai').expect
const pull = require('pull-stream')

const IPFS = require('../../src/core')
const createTempRepo = require('../utils/create-repo-node.js')

describe('files dir', () => {

  const files = []
  for(let i = 0; i < 1005; i++) {
    files.push({
      path: 'test-folder/' + i,
      content: new Buffer('some content ' + i)
    })
  }

  describe('without sharding', () => {
    let ipfs

    before((done) => {
      ipfs = new IPFS({
        repo: createTempRepo(),
        config: {
          Bootstrap: []
        }
      })
      ipfs.once('start', done)
    })

    after((done) => {
      ipfs.stop(done)
    })

    it('should be able to add dir without sharding', (done) => {
      pull(
        pull.values(files),
        ipfs.files.createAddPullStream(),
        pull.collect((err, results) => {
          const last = results[results.length - 1]
          expect(last.path).to.be.eql('test-folder')
          expect(last.hash).to.be.eql('QmWWM8ZV6GPhqJ46WtKcUaBPNHN5yQaFsKDSQ1RE73w94Q')
          done()
        })
      )

      after((done) => {
        ipfs.stop(() => done()) // ignore stop errors
      })

    }).timeout(4000)
  })

  describe('with sharding', () => {
    let ipfs

    before((done) => {
      ipfs = new IPFS({
        repo: createTempRepo(),
        config: {
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
          const last = results[results.length - 1]
          expect(last.path).to.be.eql('test-folder')
          expect(last.hash).to.be.eql('QmZjYC1kWrLmiRYbEmGSo2PEpMixzT2k2xoCKSBzt8KDcy')
          done()
        })
      )

    }).timeout(4000)
  })
})

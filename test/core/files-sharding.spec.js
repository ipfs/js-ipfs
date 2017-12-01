/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const pull = require('pull-stream')

const IPFS = require('../../src/core')
const createTempRepo = require('../utils/create-repo-nodejs.js')

describe('files directory (sharding tests)', () => {
  function createTestFiles () {
    const files = []

    for (let i = 0; i < 1005; i++) {
      files.push({
        path: 'test-folder/' + i,
        content: Buffer.from('some content ' + i)
      })
    }

    return files
  }

  describe('without sharding', () => {
    let ipfs

    before(function (done) {
      this.timeout(40 * 1000)

      ipfs = new IPFS({
        repo: createTempRepo(),
        config: {
          Addresses: {
            Swarm: []
          },
          Bootstrap: [],
          Discovery: {
            MDNS: {
              Enabled: false
            }
          }
        }
      })
      ipfs.once('ready', done)
    })

    after(function (done) {
      this.timeout(40 * 1000)
      ipfs.stop(done)
    })

    it('should be able to add dir without sharding', function (done) {
      this.timeout(40 * 1000)

      pull(
        pull.values(createTestFiles()),
        ipfs.files.addPullStream(),
        pull.collect((err, results) => {
          expect(err).to.not.exist()
          const last = results[results.length - 1]
          expect(last.path).to.eql('test-folder')
          expect(last.hash).to.eql('QmWWM8ZV6GPhqJ46WtKcUaBPNHN5yQaFsKDSQ1RE73w94Q')
          done()
        })
      )
    })
  })

  describe('with sharding', () => {
    let ipfs

    before(function (done) {
      this.timeout(40 * 1000)

      ipfs = new IPFS({
        repo: createTempRepo(),
        config: {
          Addresses: {
            Swarm: []
          },
          Bootstrap: [],
          Discovery: {
            MDNS: {
              Enabled: false
            }
          }
        },
        EXPERIMENTAL: {
          sharding: true
        }
      })
      ipfs.once('ready', done)
    })

    after(function (done) {
      this.timeout(40 * 1000)
      ipfs.stop(done)
    })

    it('should be able to add dir with sharding', function (done) {
      this.timeout(40 * 1000)

      pull(
        pull.values(createTestFiles()),
        ipfs.files.addPullStream(),
        pull.collect((err, results) => {
          expect(err).to.not.exist()
          const last = results[results.length - 1]
          expect(last.path).to.eql('test-folder')
          expect(last.hash).to.eql('Qmb3JNLq2KcvDTSGT23qNQkMrr4Y4fYMktHh6DtC7YatLa')
          done()
        })
      )
    })
  })
})

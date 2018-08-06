/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const pull = require('pull-stream')
const os = require('os')
const path = require('path')
const hat = require('hat')

const IPFS = require('../../src/core')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc', exec: IPFS })

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

  describe('files cat non-existant hash', () => {
    let ipfs

    before(function (done) {
      this.timeout(40 * 1000)

      // ipfs.init(done)
    })

    // after(function (done) {
    //   this.timeout(40 * 1000)
    //   ipfsd.stop(done)
    // })
    it('hello world', (done) => {
      const hash = 'QmWWM8ZV6GPhqJ46WtKcUaBPNHN5yQaFsKDSQ1RE73w94Q'
      // expect(last.hash).to.eql('')
      const repoPath = path.join(os.tmpdir(), hat())
      ipfs = new IPFS({
        repo: repoPath,
        start: false,
        init: true
      })
      ipfs.once('error', done)
      ipfs.once('init', () => {
        const stream = ipfs.files.catReadableStream(hash, {})
        stream.pipe(process.stdout)
        stream.once('error', done)
        stream.once('end', done)
      })

      // stream.once('error', (err) => {
      // st// argv.onComplete(err)
      // })// st

      // stream.once('end', argv.onComplete || function () {})
      // console.log('heh, done')
      // done()
    })
  })

  describe('without sharding', () => {
    let ipfs
    let ipfsd

    before(function (done) {
      this.timeout(40 * 1000)

      df.spawn({
        exec: IPFS,
        initOptions: { bits: 512 },
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
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        ipfs = _ipfsd.api
        done()
      })
    })

    after(function (done) {
      this.timeout(40 * 1000)
      ipfsd.stop(done)
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
    let ipfsd

    before(function (done) {
      this.timeout(40 * 1000)

      df.spawn({
        exec: IPFS,
        initOptions: { bits: 512 },
        args: ['--enable-sharding-experiment'],
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
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        ipfs = _ipfsd.api
        done()
      })
    })

    after(function (done) {
      this.timeout(40 * 1000)
      ipfsd.stop(done)
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

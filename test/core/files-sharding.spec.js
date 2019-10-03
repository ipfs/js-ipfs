/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const pull = require('pull-stream')

const IPFS = require('../../src/core')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  type: 'proc',
  IpfsClient: require('ipfs-http-client')
})

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
    let ipfsd

    before(async function () {
      this.timeout(40 * 1000)

      ipfsd = await df.spawn({
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
        },
        preload: { enabled: false }
      })
      ipfs = ipfsd.api
    })

    after(function () {
      if (ipfsd) {
        this.timeout(40 * 1000)
        return ipfsd.stop()
      }
    })

    it('should be able to add dir without sharding', function (done) {
      this.timeout(70 * 1000)

      pull(
        pull.values(createTestFiles()),
        ipfs.addPullStream(),
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

    before(async function () {
      this.timeout(40 * 1000)

      ipfsd = await df.spawn({
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
        },
        preload: { enabled: false }
      })
      ipfs = ipfsd.api
    })

    after(function () {
      if (ipfsd) {
        this.timeout(40 * 1000)
        return ipfsd.stop()
      }
    })

    it('should be able to add dir with sharding', function (done) {
      this.timeout(80 * 1000)

      pull(
        pull.values(createTestFiles()),
        ipfs.addPullStream(),
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

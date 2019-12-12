/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const pull = require('pull-stream')
const factory = require('../utils/factory')

describe('files directory (sharding tests)', function () {
  this.timeout(40 * 1000)
  const df = factory()
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
      ipfsd = await df.spawn()
      ipfs = ipfsd.api
    })

    after(() => df.clean())

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
      ipfsd = await df.spawn({
        ipfsOptions: { EXPERIMENTAL: { sharding: true } }
      })
      ipfs = ipfsd.api
    })

    after(() => df.clean())

    it('should be able to add dir with sharding', function (done) {
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

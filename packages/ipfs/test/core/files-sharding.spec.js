/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const last = require('it-last')
const { Buffer } = require('buffer')
const factory = require('../utils/factory')

describe('files directory (sharding tests)', function () {
  this.timeout(40 * 1000)
  const df = factory()

  const testFiles = Array.from(Array(1005), (_, i) => ({
    path: 'test-folder/' + i,
    content: Buffer.from('some content ' + i)
  }))

  describe('without sharding', () => {
    let ipfs
    let ipfsd

    before(async function () {
      ipfsd = await df.spawn({
        ipfsOptions: { EXPERIMENTAL: { sharding: false } }
      })
      ipfs = ipfsd.api
    })

    after(() => df.clean())

    it('should be able to add dir without sharding', async () => {
      const { path, cid } = await last(ipfs.add(testFiles))
      expect(path).to.eql('test-folder')
      expect(cid.toString()).to.eql('QmWWM8ZV6GPhqJ46WtKcUaBPNHN5yQaFsKDSQ1RE73w94Q')
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

    it('should be able to add dir with sharding', async () => {
      const { path, cid } = await last(ipfs.add(testFiles))
      expect(path).to.eql('test-folder')
      expect(cid.toString()).to.eql('Qmb3JNLq2KcvDTSGT23qNQkMrr4Y4fYMktHh6DtC7YatLa')
    })
  })
})

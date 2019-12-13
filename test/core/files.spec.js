/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const hat = require('hat')
const pull = require('pull-stream')
const factory = require('../utils/factory')

describe('files', function () {
  this.timeout(10 * 1000)
  const df = factory()
  let ipfsd, ipfs

  before(async () => {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => df.clean())

  describe('get', () => {
    it('should callback with error for invalid IPFS path input', (done) => {
      const invalidPath = null
      ipfs.get(invalidPath, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PATH')
        done()
      })
    })
  })

  describe('getReadableStream', () => {
    it('should return erroring stream for invalid IPFS path input', (done) => {
      const invalidPath = null
      const stream = ipfs.getReadableStream(invalidPath)

      stream.on('data', () => {})
      stream.on('error', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PATH')
        done()
      })
    })
  })

  describe('getPullStream', () => {
    it('should return erroring stream for invalid IPFS path input', (done) => {
      const invalidPath = null
      pull(
        ipfs.getPullStream(invalidPath),
        pull.collect((err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_PATH')
          done()
        })
      )
    })
  })

  describe('add', () => {
    it('should not error when passed null options', async () => {
      await ipfs.add(Buffer.from(hat()), null)
    })
  })
})

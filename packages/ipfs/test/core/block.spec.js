/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const { nanoid } = require('nanoid')
const all = require('it-all')
const uint8ArrayFromString = require('uint8arrays/from-string')
const factory = require('../utils/factory')

describe('block', () => {
  let ipfs
  const df = factory()

  before(async () => {
    ipfs = (await df.spawn()).api
  })

  after(() => df.clean())

  describe('get', () => {
    it('should throw error for invalid CID input', () => {
      return expect(ipfs.block.get('INVALID CID'))
        .to.eventually.be.rejected()
        .and.to.have.a.property('code').that.equals('ERR_INVALID_CID')
    })
  })

  describe('put', () => {
    it('should not error when passed null options', () => {
      return ipfs.block.put(uint8ArrayFromString(nanoid()), null)
    })
  })

  describe('rm', () => {
    it('should throw error for invalid CID input', () => {
      return expect(all(ipfs.block.rm('INVALID CID')))
        .to.eventually.be.rejected()
        .and.to.have.a.property('code').that.equals('ERR_INVALID_CID')
    })
  })

  describe('stat', () => {
    it('should throw error for invalid CID input', () => {
      return expect(ipfs.block.stat('INVALID CID'))
        .to.eventually.be.rejected()
        .and.to.have.a.property('code').that.equals('ERR_INVALID_CID')
    })

    it('should not error when passed null options', async () => {
      const block = await ipfs.block.put(uint8ArrayFromString(nanoid()))
      return ipfs.block.stat(block.cid, null)
    })
  })
})

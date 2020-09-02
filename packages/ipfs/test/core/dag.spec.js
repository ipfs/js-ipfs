/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const all = require('it-all')
const factory = require('../utils/factory')
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('dag', function () {
  this.timeout(10 * 1000)
  const df = factory()
  let ipfs

  before(async () => {
    ipfs = (await df.spawn()).api
  })

  after(() => df.clean())

  describe('get', () => {
    it('should throw error for invalid string CID input', () => {
      return expect(ipfs.dag.get('INVALID CID'))
        .to.eventually.be.rejected()
        .and.to.have.property('code').that.equals('ERR_INVALID_CID')
    })

    it('should throw error for invalid buffer CID input', () => {
      return expect(ipfs.dag.get(uint8ArrayFromString('INVALID CID')))
        .to.eventually.be.rejected()
        .and.to.have.property('code').that.equals('ERR_INVALID_CID')
    })
  })

  describe('tree', () => {
    it('should throw error for invalid CID input', () => {
      return expect(all(ipfs.dag.tree('INVALID CID')))
        .to.eventually.be.rejected()
        .and.to.have.property('code').that.equals('ERR_INVALID_CID')
    })
  })
})

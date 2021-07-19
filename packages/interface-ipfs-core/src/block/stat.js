/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { CID } = require('multiformats/cid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.stat', () => {
    const data = uint8ArrayFromString('blorb')
    let ipfs, cid

    before(async () => {
      ipfs = (await common.spawn()).api
      cid = await ipfs.block.put(data)
    })

    after(() => common.clean())

    it('should respect timeout option when statting a block', () => {
      return testTimeout(() => ipfs.block.stat(CID.parse('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn'), {
        timeout: 1
      }))
    })

    it('should stat by CID', async () => {
      const stats = await ipfs.block.stat(cid)
      expect(stats.cid.toString()).to.equal(cid.toString())
      expect(stats).to.have.property('size', data.length)
    })

    it('should return error for missing argument', () => {
      return expect(ipfs.block.stat(null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return error for invalid argument', () => {
      return expect(ipfs.block.stat('invalid')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}

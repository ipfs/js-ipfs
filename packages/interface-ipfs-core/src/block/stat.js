/* eslint-env mocha */
'use strict'

const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')
const { CID } = require('multiformats/cid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.stat', () => {
    const data = uint8ArrayFromString('blorb')
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    /** @type {CID} */
    let cid

    before(async () => {
      ipfs = (await factory.spawn()).api
      cid = await ipfs.block.put(data)
    })

    after(() => factory.clean())

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
      // @ts-expect-error invalid input
      return expect(ipfs.block.stat(null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return error for invalid argument', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.block.stat('invalid')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}

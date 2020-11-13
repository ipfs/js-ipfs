/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.unwant', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should throw error for invalid CID input', async () => {
      await expect(ipfs.bitswap.unwant('INVALID CID')).to.eventually.be.rejected()
    })
  })
}

/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')
const { expectIsBitswap } = require('./utils')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bitswap', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get bitswap stats', async () => {
      const res = await ipfs.stats.bitswap()
      expectIsBitswap(null, res)
    })
  })
}

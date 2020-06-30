/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.repo', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when getting repo stats', () => {
      return testTimeout(() => ipfs.stats.repo({
        timeout: 1
      }))
    })

    it('should get repo stats', async () => {
      const res = await ipfs.stats.repo()
      expectIsRepo(null, res)
    })
  })
}

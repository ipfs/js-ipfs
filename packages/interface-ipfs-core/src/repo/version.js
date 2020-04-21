/* eslint-env mocha */
'use strict'

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

  describe('.repo.version', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when getting the repo version', () => {
      return testTimeout(() => ipfs.repo.version({
        timeout: 1
      }))
    })

    it('should get the repo version', async () => {
      const version = await ipfs.repo.version()
      expect(version).to.exist()
    })
  })
}

/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')
/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.profiles.list', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should list config profiles', async () => {
      const profiles = await ipfs.config.profiles.list()

      expect(profiles).to.be.an('array')
      expect(profiles).not.to.be.empty()

      profiles.forEach(profile => {
        expect(profile.name).to.be.a('string')
        expect(profile.description).to.be.a('string')
      })
    })
  })
}

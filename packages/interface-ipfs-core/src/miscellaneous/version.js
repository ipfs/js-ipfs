/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.version', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get the node version', async () => {
      const result = await ipfs.version()
      expect(result).to.have.a.property('version')
      expect(result).to.have.a.property('commit')
      expect(result).to.have.a.property('repo')
    })
  })
}

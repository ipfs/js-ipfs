/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('../stats/utils')
const { getDescribe, getIt } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.repo.stat', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get repo stats', async () => {
      const res = await ipfs.repo.stat()
      expectIsRepo(null, res)
    })
  })
}

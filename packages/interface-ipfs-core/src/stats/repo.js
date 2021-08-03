/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

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

  describe('.stats.repo', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get repo stats', async () => {
      const res = await ipfs.stats.repo()
      expectIsRepo(null, res)
    })
  })
}

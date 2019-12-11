/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const pullToPromise = require('pull-to-promise')
const { getDescribe, getIt } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bwPullStream', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get bandwidth stats over pull stream', async () => {
      const stream = ipfs.stats.bwPullStream()

      const data = await pullToPromise.any(stream)
      expectIsBandwidth(null, data[0])
    })
  })
}

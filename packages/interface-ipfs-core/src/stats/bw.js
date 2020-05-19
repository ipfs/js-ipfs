/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')
const last = require('it-last')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bw', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when getting bandwith stats', () => {
      return testTimeout(() => ipfs.stats.bw({
        timeout: 1
      }))
    })

    it('should get bandwidth stats ', async () => {
      const res = await last(ipfs.stats.bw())
      expectIsBandwidth(null, res)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const last = require('it-last')
const all = require('it-all')

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

    it('should get bandwidth stats ', async () => {
      const res = await last(ipfs.stats.bw())
      expectIsBandwidth(null, res)
    })

    it('should throw error for invalid interval option', async () => {
      await expect(all(ipfs.stats.bw({ poll: true, interval: 'INVALID INTERVAL' })))
        .to.eventually.be.rejected()
        .with.property('message').that.matches(/invalid duration/)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')
const getStream = require('get-stream')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bwReadableStream', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get bandwidth stats over readable stream', async () => {
      const stream = ipfs.stats.bwReadableStream()

      const [data] = await getStream.array(stream)

      expectIsBandwidth(null, data)
    })
  })
}

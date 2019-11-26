/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const pullToPromise = require('pull-to-promise')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.bwPullStream', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get bandwidth stats over pull stream', async () => {
      const stream = ipfs.stats.bwPullStream()

      const data = await pullToPromise.any(stream)
      expectIsBandwidth(null, data[0])
    })
  })
}

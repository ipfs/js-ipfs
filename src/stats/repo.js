/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.repo', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get repo stats', async () => {
      const res = await ipfs.stats.repo()
      expectIsRepo(null, res)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.repo', () => {
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get repo stats', async () => {
      const res = await ipfs.stats.repo()
      expectIsRepo(null, res)
    })
  })
}

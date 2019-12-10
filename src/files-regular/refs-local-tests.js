/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, suiteName, ipfsRefsLocal, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe(suiteName, function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get local refs', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt')
      ]

      await ipfs.add(dirs)

      const refs = await ipfsRefsLocal(ipfs)

      const cids = refs.map(r => r.ref)
      expect(cids).to.include('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn')
      expect(cids).to.include('QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr')
    })
  })
}

/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.mv', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    before(async () => {
      await ipfs.files.mkdir('/test/lv1/lv2', { parents: true })
      await ipfs.files.write('/test/a', Buffer.from('Hello, world!'), { create: true })
    })
    after(() => common.teardown())

    it('should not move not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.mv(`${testDir}/404`, `${testDir}/a`)).to.eventually.be.rejected()
    })

    it('should move file, expect no error', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1/lv2`, { parents: true })
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      await ipfs.files.mv(`${testDir}/a`, `${testDir}/c`)
    })

    it('should move dir, expect no error', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1/lv2`, { parents: true })
      await ipfs.files.mv('/test/lv1/lv2', '/test/lv1/lv4')
    })
  })
}

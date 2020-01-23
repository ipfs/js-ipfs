/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.mv', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    before(async () => {
      await ipfs.files.mkdir('/test/lv1/lv2', { parents: true })
      await ipfs.files.write('/test/a', Buffer.from('Hello, world!'), { create: true })
    })
    after(() => common.clean())

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

/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.cp', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should copy file, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.cp(`${testDir}/c`, `${testDir}/b`)).to.eventually.be.rejected()
    })

    it('should copy file, expect no error', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/a`, Buffer.from('TEST'), { create: true })
      await ipfs.files.cp(`${testDir}/a`, `${testDir}/b`)
    })

    it('should copy dir, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.cp(`${testDir}/lv1/lv3`, `${testDir}/lv1/lv4`)).to.eventually.be.rejected()
    })

    it('should copy dir, expect no error', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1/lv2`, { parents: true })
      await ipfs.files.cp(`${testDir}/lv1/lv2`, `${testDir}/lv1/lv3`)
    })

    it('should copy from outside of mfs', async () => {
      const [{
        hash
      }] = await ipfs.add(fixtures.smallFile.data)
      const testFilePath = `/${hat()}`
      await ipfs.files.cp(`/ipfs/${hash}`, testFilePath)
      const testFileData = await ipfs.files.read(testFilePath)
      expect(testFileData).to.eql(fixtures.smallFile.data)
    })
  })
}

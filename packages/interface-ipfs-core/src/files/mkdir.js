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

  describe('.files.mkdir', function () {
    this.timeout(40 * 1000)

    let ipfs

    async function testMode (mode, expectedMode) {
      const testPath = `/test-${hat()}`
      await ipfs.files.mkdir(testPath, {
        mode
      })

      const stats = await ipfs.files.stat(testPath)
      expect(stats).to.have.property('mode', expectedMode)
    }

    async function testMtime (mtime, expectedMtime) {
      const testPath = `/test-${hat()}`
      await ipfs.files.mkdir(testPath, {
        mtime
      })

      const stats = await ipfs.files.stat(testPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should make directory on root', () => {
      const testDir = `/test-${hat()}`

      return ipfs.files.mkdir(testDir)
    })

    it('should make directory and its parents', () => {
      const testDir = `/test-${hat()}`

      return ipfs.files.mkdir(`${testDir}/lv1/lv2`, { parents: true })
    })

    it('should not make already existent directory', () => {
      return expect(ipfs.files.mkdir('/')).to.eventually.be.rejected()
    })

    it('should make directory and have default mode', async function () {
      await testMode(undefined, parseInt('0755', 8))
    })

    it('should make directory and specify mode as string', async function () {
      const mode = '0321'
      await testMode(mode, parseInt(mode, 8))
    })

    it('should make directory and specify mode as number', async function () {
      const mode = parseInt('0321', 8)
      await testMode(mode, mode)
    })

    it('should make directory and specify mtime as Date', async function () {
      const mtime = new Date(5000)
      await testMtime(mtime, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should make directory and specify mtime as { nsecs, secs }', async function () {
      const mtime = {
        secs: 5,
        nsecs: 0
      }
      await testMtime(mtime, mtime)
    })

    it('should make directory and specify mtime as timespec', async function () {
      await testMtime({
        Seconds: 5,
        FractionalNanoseconds: 0
      }, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should make directory and specify mtime as hrtime', async function () {
      const mtime = process.hrtime()
      await testMtime(mtime, {
        secs: mtime[0],
        nsecs: mtime[1]
      })
    })
  })
}

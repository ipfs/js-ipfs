/* eslint-env mocha */
'use strict'

const hat = require('hat')
const all = require('it-all')
const concat = require('it-concat')
const { fixtures } = require('../utils')
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
      const [{ cid }] = await all(ipfs.add(fixtures.smallFile.data))
      const testFilePath = `/${hat()}`
      await ipfs.files.cp(`/ipfs/${cid}`, testFilePath)
      const testFileData = await concat(ipfs.files.read(testFilePath))
      expect(testFileData.slice()).to.eql(fixtures.smallFile.data)
    })

    it('should respect metadata when copying files', async function () {
      const testSrcPath = `/test-${hat()}`
      const testDestPath = `/test-${hat()}`
      const mode = parseInt('0321', 8)
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime - (seconds * 1000)) * 1000
      }

      await ipfs.files.write(testSrcPath, Buffer.from('TEST'), {
        create: true,
        mode,
        mtime
      })
      await ipfs.files.cp(testSrcPath, testDestPath)

      const stats = await ipfs.files.stat(testDestPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
      expect(stats).to.have.property('mode', mode)
    })

    it('should respect metadata when copying directories', async function () {
      const testSrcPath = `/test-${hat()}`
      const testDestPath = `/test-${hat()}`
      const mode = parseInt('0321', 8)
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime - (seconds * 1000)) * 1000
      }

      await ipfs.files.mkdir(testSrcPath, {
        mode,
        mtime
      })
      await ipfs.files.cp(testSrcPath, testDestPath, {
        recursive: true
      })

      const stats = await ipfs.files.stat(testDestPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
      expect(stats).to.have.property('mode', mode)
    })

    it('should respect metadata when copying from outside of mfs', async function () {
      const testDestPath = `/test-${hat()}`
      const mode = parseInt('0321', 8)
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime - (seconds * 1000)) * 1000
      }

      const [{
        cid
      }] = await all(ipfs.add({
        content: fixtures.smallFile.data,
        mode,
        mtime
      }))
      await ipfs.files.cp(`/ipfs/${cid}`, testDestPath)

      const stats = await ipfs.files.stat(testDestPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
      expect(stats).to.have.property('mode', mode)
    })
  })
}

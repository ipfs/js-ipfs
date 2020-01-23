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

  describe('.files.write', function () {
    this.timeout(40 * 1000)

    let ipfs

    async function testMode (mode, expectedMode) {
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true,
        parents: true,
        mode
      })

      const stats = await ipfs.files.stat(testPath)
      expect(stats).to.have.property('mode', expectedMode)
    }

    async function testMtime (mtime, expectedMtime) {
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true,
        parents: true,
        mtime
      })

      const stats = await ipfs.files.stat(testPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not write to non existent file, expect error', function () {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'))).to.eventually.be.rejected()
    })

    it('should write to non existent file with create flag', async function () {
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), { create: true })

      const stats = await ipfs.files.stat(testPath)
      expect(stats.type).to.equal('file')
    })

    it('should write to deeply nested non existent file with create and parents flags', async function () {
      const testPath = `/foo/bar/baz/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), { create: true, parents: true })

      const stats = await ipfs.files.stat(testPath)
      expect(stats.type).to.equal('file')
    })

    it('should write file and specify mode as a string', async function () {
      const mode = '0321'
      await testMode(mode, parseInt(mode, 8))
    })

    it('should write file and specify mode as a number', async function () {
      const mode = parseInt('0321', 8)
      await testMode(mode, mode)
    })

    it('should write file and specify mtime as Date', async function () {
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime.getTime() - (seconds * 1000)) * 1000
      }
      await testMtime(mtime, expectedMtime)
    })

    it('should write file and specify mtime as { nsecs, secs }', async function () {
      const mtime = {
        secs: 5,
        nsecs: 0
      }
      await testMtime(mtime, mtime)
    })

    it('should write file and specify mtime as timespec', async function () {
      await testMtime({
        Seconds: 5,
        FractionalNanoseconds: 0
      }, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should write file and specify mtime as hrtime', async function () {
      const mtime = process.hrtime()
      await testMtime(mtime, {
        secs: mtime[0],
        nsecs: mtime[1]
      })
    })
  })
}

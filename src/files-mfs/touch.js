/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('delay')

module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.touch', function () {
    this.timeout(10 * 1000)

    let ipfs

    async function testMtime (mtime, expectedMtime) {
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true
      })

      const stat = await ipfs.files.stat(testPath)
      expect(stat).to.not.have.deep.property('mtime', expectedMtime)

      await ipfs.files.touch(testPath, {
        mtime
      })

      const stat2 = await ipfs.files.stat(testPath)
      expect(stat2).to.have.nested.deep.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should have default mtime', async function () {
      this.slow(5 * 1000)
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true
      })

      const stat = await ipfs.files.stat(testPath)
      expect(stat).to.not.have.property('mtime')

      await ipfs.files.touch(testPath)

      const stat2 = await ipfs.files.stat(testPath)
      expect(stat2).to.have.property('mtime').that.does.not.deep.equal({
        secs: 0,
        nsecs: 0
      })
    })

    it('should update file mtime', async function () {
      this.slow(5 * 1000)
      const testPath = `/test-${hat()}`
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true,
        mtime
      })
      await delay(2000)
      await ipfs.files.touch(testPath)

      const stat = await ipfs.files.stat(testPath)
      expect(stat).to.have.nested.property('mtime.secs').that.is.greaterThan(seconds)
    })

    it('should update directory mtime', async function () {
      this.slow(5 * 1000)
      const testPath = `/test-${hat()}`
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)

      await ipfs.files.mkdir(testPath, {
        create: true,
        mtime
      })
      await delay(2000)
      await ipfs.files.touch(testPath)

      const stat2 = await ipfs.files.stat(testPath)
      expect(stat2).to.have.nested.property('mtime.secs').that.is.greaterThan(seconds)
    })

    it('should set mtime as Date', async function () {
      await testMtime(new Date(5000), {
        secs: 5,
        nsecs: 0
      })
    })

    it('should set mtime as { nsecs, secs }', async function () {
      const mtime = {
        secs: 5,
        nsecs: 0
      }
      await testMtime(mtime, mtime)
    })

    it('should set mtime as timespec', async function () {
      await testMtime({
        Seconds: 5,
        FractionalNanoseconds: 0
      }, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should set mtime as hrtime', async function () {
      const mtime = process.hrtime()
      await testMtime(mtime, {
        secs: mtime[0],
        nsecs: mtime[1]
      })
    })
  })
}

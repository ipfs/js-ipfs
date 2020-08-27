/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayConcat = require('uint8arrays/concat')
const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('delay')
const testTimeout = require('../utils/test-timeout')
const all = require('it-all')

module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.touch', function () {
    this.timeout(120 * 1000)

    let ipfs

    async function testMtime (mtime, expectedMtime) {
      const testPath = `/test-${nanoid()}`

      await ipfs.files.write(testPath, uint8ArrayFromString('Hello, world!'), {
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
      const testPath = `/test-${nanoid()}`

      await ipfs.files.write(testPath, uint8ArrayFromString('Hello, world!'), {
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
      const testPath = `/test-${nanoid()}`
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)

      await ipfs.files.write(testPath, uint8ArrayFromString('Hello, world!'), {
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
      const testPath = `/test-${nanoid()}`
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

    it('should update the mtime for a hamt-sharded-directory', async () => {
      const path = `/foo-${Math.random()}`

      await ipfs.files.mkdir(path, {
        mtime: new Date()
      })
      await ipfs.files.write(`${path}/foo.txt`, uint8ArrayFromString('Hello world'), {
        create: true,
        shardSplitThreshold: 0
      })
      const originalMtime = (await ipfs.files.stat(path)).mtime
      await delay(1000)
      await ipfs.files.touch(path, {
        flush: true
      })

      const updatedMtime = (await ipfs.files.stat(path)).mtime
      expect(updatedMtime.secs).to.be.greaterThan(originalMtime.secs)
    })

    it('should create an empty file', async () => {
      const path = `/foo-${Math.random()}`

      await ipfs.files.touch(path, {
        flush: true
      })

      const bytes = uint8ArrayConcat(await all(ipfs.files.read(path)))

      expect(bytes.slice()).to.deep.equal(Uint8Array.from([]))
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

    it('should respect timeout option when updating the modification time of files', async () => {
      await testTimeout(() => ipfs.files.touch('/derp', {
        timeout: 1
      }))
    })
  })
}

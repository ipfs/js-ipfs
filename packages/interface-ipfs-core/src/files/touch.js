/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { nanoid } from 'nanoid'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import delay from 'delay'
import all from 'it-all'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testTouch (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.touch', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    /**
     * @param {import('ipfs-unixfs').MtimeLike} mtime
     * @param {import('ipfs-unixfs').MtimeLike} expectedMtime
     */
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
      expect(stat2).to.have.deep.nested.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should have default mtime', async function () {
      // @ts-ignore this is mocha
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
      // @ts-ignore this is mocha
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
      // @ts-ignore this is mocha
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

      if (!originalMtime) {
        throw new Error('No originalMtime found')
      }

      await delay(1000)
      await ipfs.files.touch(path, {
        flush: true
      })

      const updatedMtime = (await ipfs.files.stat(path)).mtime

      if (!updatedMtime) {
        throw new Error('No updatedMtime found')
      }

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
  })
}

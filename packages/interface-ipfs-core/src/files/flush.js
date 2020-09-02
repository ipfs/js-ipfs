/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.flush', function () {
    this.timeout(120 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not flush not found file/dir, expect error', async () => {
      const testDir = `/test-${nanoid()}`

      try {
        await ipfs.files.flush(`${testDir}/404`)
      } catch (err) {
        expect(err).to.exist()
      }
    })

    it('should require a path', () => {
      expect(ipfs.files.flush()).to.eventually.be.rejected()
    })

    it('should flush root', async () => {
      const root = await ipfs.files.stat('/')
      const flushed = await ipfs.files.flush('/')

      expect(root.cid.toString()).to.equal(flushed.toString())
    })

    it('should flush specific dir', async () => {
      const testDir = `/test-${nanoid()}`

      await ipfs.files.mkdir(testDir, { parents: true })

      const dirStats = await ipfs.files.stat(testDir)
      const flushed = await ipfs.files.flush(testDir)

      expect(dirStats.cid.toString()).to.equal(flushed.toString())
    })

    it('should respect timeout option when flushing changes', async () => {
      await testTimeout(() => ipfs.files.flush('/', {
        timeout: 1
      }))
    })
  })
}

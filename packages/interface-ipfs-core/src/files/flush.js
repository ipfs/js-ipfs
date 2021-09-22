/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testFlush (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.flush', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should not flush not found file/dir, expect error', async () => {
      const testDir = `/test-${nanoid()}`

      try {
        await ipfs.files.flush(`${testDir}/404`)
      } catch (/** @type {any} */ err) {
        expect(err).to.exist()
      }
    })

    it('should require a path', () => {
      // @ts-expect-error invalid args
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
  })
}

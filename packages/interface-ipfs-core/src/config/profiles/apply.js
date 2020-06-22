/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')
const testTimeout = require('../../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.profiles.apply', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when applying a config profile', () => {
      return testTimeout(() => ipfs.config.profiles.apply('server', {
        timeout: 1
      }))
    })

    it('should apply a config profile', async () => {
      const diff = await ipfs.config.profiles.apply('lowpower')
      expect(diff.original.Swarm.ConnMgr.LowWater).to.not.equal(diff.updated.Swarm.ConnMgr.LowWater)

      const newConfig = await ipfs.config.getAll()
      expect(newConfig.Swarm.ConnMgr.LowWater).to.equal(diff.updated.Swarm.ConnMgr.LowWater)
    })

    it('should strip private key from diff output', async () => {
      const originalConfig = await ipfs.config.getAll()
      const diff = await ipfs.config.profiles.apply('default-networking', { dryRun: true })

      // should have stripped private key from diff output
      expect(originalConfig).to.have.nested.property('Identity.PrivKey')
      expect(diff).to.not.have.nested.property('original.Identity.PrivKey')
      expect(diff).to.not.have.nested.property('updated.Identity.PrivKey')
    })

    it('should not apply a config profile in dry-run mode', async () => {
      const originalConfig = await ipfs.config.getAll()

      await ipfs.config.profiles.apply('server', { dryRun: true })

      const updatedConfig = await ipfs.config.getAll()

      expect(updatedConfig).to.deep.equal(originalConfig)
    })
  })
}

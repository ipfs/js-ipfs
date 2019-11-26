/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.config.profiles.apply', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should apply a config profile', async () => {
      const diff = await ipfs.config.profiles.apply('lowpower')
      expect(diff.original.Swarm.ConnMgr.LowWater).to.not.equal(diff.updated.Swarm.ConnMgr.LowWater)

      const newConfig = await ipfs.config.get()
      expect(newConfig.Swarm.ConnMgr.LowWater).to.equal(diff.updated.Swarm.ConnMgr.LowWater)
    })

    it('should strip private key from diff output', async () => {
      const originalConfig = await ipfs.config.get()
      const diff = await ipfs.config.profiles.apply('default-networking', { dryRun: true })

      // should have stripped private key from diff output
      expect(originalConfig).to.have.nested.property('Identity.PrivKey')
      expect(diff).to.not.have.nested.property('original.Identity.PrivKey')
      expect(diff).to.not.have.nested.property('updated.Identity.PrivKey')
    })

    it('should not apply a config profile in dry-run mode', async () => {
      const originalConfig = await ipfs.config.get()

      await ipfs.config.profiles.apply('server', { dryRun: true })

      const updatedConfig = await ipfs.config.get()

      expect(updatedConfig).to.deep.equal(originalConfig)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')
const waterfall = require('async/waterfall')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.config.profiles.apply', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should apply a config profile', (done) => {
      let diff
      waterfall([
        (cb) => ipfs.config.profiles.apply('lowpower', cb),
        (_diff, cb) => {
          diff = _diff
          expect(diff.original.Swarm.ConnMgr.LowWater).to.not.equal(diff.updated.Swarm.ConnMgr.LowWater)
          ipfs.config.get(cb)
        },
        (newConfig, cb) => {
          expect(newConfig.Swarm.ConnMgr.LowWater).to.equal(diff.updated.Swarm.ConnMgr.LowWater)
          cb()
        }
      ], done)
    })

    it('should not apply a config profile in dry-run mode', (done) => {
      let originalConfig
      waterfall([
        (cb) => ipfs.config.get(cb),
        (config, cb) => {
          originalConfig = config
          cb()
        },
        (cb) => ipfs.config.profiles.apply('server', { dryRun: true }, cb),
        (diff, cb) => {
          expect(diff.original).to.deep.equal(originalConfig)
          expect(diff.updated).to.not.deep.equal(originalConfig)
          ipfs.config.get(cb)
        },
        (updatedConfig, cb) => {
          expect(updatedConfig).to.deep.equal(originalConfig)
          cb()
        }
      ], done)
    })
  })
}

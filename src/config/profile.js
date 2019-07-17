/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const waterfall = require('async/waterfall')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.config.profile', function () {
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

    it('should output changes but not save them for dry run', (done) => {
      let config
      waterfall([
        (cb) => ipfs.config.get(cb),
        (_config, cb) => {
          config = _config
          ipfs.config.profile('lowpower', { dryRun: true }, cb)
        },
        (diff, cb) => {
          expect(diff.oldCfg.Swarm.ConnMgr.LowWater).to.not.equal(diff.newCfg.Swarm.ConnMgr.LowWater)
          ipfs.config.get(cb)
        },
        (newConfig, cb) => {
          expect(newConfig.Swarm.ConnMgr.LowWater).to.equal(config.Swarm.ConnMgr.LowWater)
          cb()
        }
      ], done)
    })

    it('should set a config profile', (done) => {
      let diff
      waterfall([
        (cb) => ipfs.config.get(cb),
        (config, cb) => ipfs.config.profile('lowpower', cb),
        (_diff, cb) => {
          diff = _diff
          expect(diff.oldCfg.Swarm.ConnMgr.LowWater).to.not.equal(diff.newCfg.Swarm.ConnMgr.LowWater)
          ipfs.config.get(cb)
        },
        (newConfig, cb) => {
          expect(newConfig.Swarm.ConnMgr.LowWater).to.equal(diff.newCfg.Swarm.ConnMgr.LowWater)
          cb()
        }
      ], done)
    })
  })
}

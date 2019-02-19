/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.repo', () => {
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

    it('should get repo stats', (done) => {
      ipfs.stats.repo((err, res) => {
        expectIsRepo(err, res)
        done()
      })
    })

    it('should get repo stats (promised)', () => {
      return ipfs.stats.repo().then((res) => {
        expectIsRepo(null, res)
      })
    })
  })
}

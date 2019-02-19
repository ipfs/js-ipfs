/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.bw', () => {
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

    it('should get bandwidth stats', function (done) {
      ipfs.stats.bw((err, res) => {
        expectIsBandwidth(err, res)
        done()
      })
    })

    it('should get bandwidth stats (promised)', () => {
      return ipfs.stats.bw().then((res) => {
        expectIsBandwidth(null, res)
      })
    })
  })
}

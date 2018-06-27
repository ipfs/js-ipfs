/* eslint-env mocha */
'use strict'

const waterfall = require('async/waterfall')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsBitswap } = require('../stats/utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.bitswap.stat', () => {
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

    it('should get bitswap stats', (done) => {
      ipfs.bitswap.stat((err, res) => {
        expectIsBitswap(err, res)
        done()
      })
    })

    it('should get bitswap stats (promised)', () => {
      return ipfs.bitswap.stat().then((res) => {
        expectIsBitswap(null, res)
      })
    })

    it('should not get bitswap stats when offline', function (done) {
      this.timeout(60 * 1000)

      waterfall([
        (cb) => createCommon().setup(cb),
        (factory, cb) => factory.spawnNode(cb),
        (node, cb) => node.stop((err) => cb(err, node))
      ], (err, node) => {
        expect(err).to.not.exist()
        node.bitswap.wantlist((err) => {
          expect(err).to.exist()
          done()
        })
      })
    })
  })
}

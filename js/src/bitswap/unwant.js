/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const waterfall = require('async/waterfall')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.bitswap.unwant', () => {
    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()

          ipfsA = nodes[0]
          ipfsB = nodes[1]

          // Add key to the wantlist for ipfsB
          ipfsB.block.get(key, () => {})

          connect(ipfsA, ipfsB.peerId.addresses[0], done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should remove a key from the wantlist', (done) => {
      waitForWantlistKey(ipfsB, key, (err) => {
        expect(err).to.not.exist()

        ipfsB.bitswap.unwant(key, (err) => {
          expect(err).to.not.exist()

          ipfsB.bitswap.wantlist((err, list) => {
            expect(err).to.not.exist()
            expect(list.Keys.every(k => k['/'] !== key)).to.equal(true)
            done()
          })
        })
      })
    })

    it('should not remove a key from the wantlist when offline', function (done) {
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

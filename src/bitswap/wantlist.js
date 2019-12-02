/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.bitswap.wantlist', function () {
    this.timeout(60 * 1000)
    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()

      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key, () => {})

      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should get the wantlist', () => {
      return waitForWantlistKey(ipfsB, key)
    })

    it('should get the wantlist by peer ID for a diffreent node', () => {
      return waitForWantlistKey(ipfsA, key, { peerId: ipfsB.peerId.id })
    })

    it('should not get the wantlist when offline', async () => {
      const node = await createCommon().setup()
      await node.stop()

      return expect(node.bitswap.stat()).to.eventually.be.rejected()
    })
  })
}

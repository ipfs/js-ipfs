/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.bitswap.wantlist', () => {
    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfsA = await common.setup()
      ipfsB = await common.setup()

      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key).catch(() => {})

      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(function () {
      this.timeout(30 * 1000)

      return common.teardown()
    })

    it('should get the wantlist', function () {
      this.timeout(60 * 1000)
      return waitForWantlistKey(ipfsB, key)
    })

    it('should get the wantlist by peer ID for a different node', function () {
      this.timeout(60 * 1000)
      return waitForWantlistKey(ipfsA, key, {
        peerId: ipfsB.peerId.id,
        timeout: 60 * 1000
      })
    })

    it('should not get the wantlist when offline', async function () {
      this.timeout(60 * 1000)

      const node = await createCommon().setup()
      await node.stop()

      return expect(node.bitswap.wantlist()).to.eventually.be.rejected()
    })
  })
}

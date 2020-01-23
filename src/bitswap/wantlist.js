/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlist', function () {
    this.timeout(60 * 1000)
    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async () => {
      ipfsA = (await common.spawn()).api
      ipfsB = (await common.spawn({ type: 'go' })).api
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key).catch(() => { /* is ok, expected on teardown */ })
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should get the wantlist', function () {
      return waitForWantlistKey(ipfsB, key)
    })

    it('should get the wantlist by peer ID for a different node', function () {
      return waitForWantlistKey(ipfsA, key, {
        peerId: ipfsB.peerId.id,
        timeout: 60 * 1000
      })
    })

    it('should not get the wantlist when offline', async () => {
      const node = await common.spawn()
      await node.stop()

      return expect(node.api.bitswap.stat()).to.eventually.be.rejected()
    })
  })
}

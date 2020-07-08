/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')
const { isWebWorker } = require('ipfs-utils/src/env')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlistForPeer', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async () => {
      ipfsA = (await common.spawn()).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key).catch(() => { /* is ok, expected on teardown */ })

      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should respect timeout option when getting bitswap wantlist by peer', () => {
      return testTimeout(() => ipfsA.bitswap.wantlistForPeer(ipfsB.peerId.id, {
        timeout: 1
      }))
    })

    it('should get the wantlist by peer ID for a different node', function () {
      return waitForWantlistKey(ipfsA, key, {
        peerId: ipfsB.peerId.id,
        timeout: 60 * 1000
      })
    })
  })
}

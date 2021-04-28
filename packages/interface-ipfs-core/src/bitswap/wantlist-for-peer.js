/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')
const { isWebWorker } = require('ipfs-utils/src/env')
const getIpfsOptions = require('../utils/ipfs-options-websockets-filter-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const ipfsOptions = getIpfsOptions()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlistForPeer', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async () => {
      ipfsA = (await common.spawn({ type: 'proc', ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key).catch(() => { /* is ok, expected on teardown */ })

      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should get the wantlist by peer ID for a different node', function () {
      return waitForWantlistKey(ipfsA, key, {
        peerId: ipfsB.peerId.id,
        timeout: 60 * 1000
      })
    })
  })
}

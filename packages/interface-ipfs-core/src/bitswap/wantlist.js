/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey, waitForWantlistKeyToBeRemoved } = require('./utils')
const { isWebWorker } = require('ipfs-utils/src/env')
const testTimeout = require('../utils/test-timeout')
const AbortController = require('abort-controller')
const CID = require('cids')
const delay = require('delay')

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
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key).catch(() => { /* is ok, expected on teardown */ })

      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should respect timeout option when getting bitswap wantlist', () => {
      return testTimeout(() => ipfsA.bitswap.wantlist({
        timeout: 1
      }))
    })

    it('should get the wantlist', function () {
      return waitForWantlistKey(ipfsB, key)
    })

    it('should not get the wantlist when offline', async () => {
      const node = await common.spawn()
      await node.stop()

      return expect(node.api.bitswap.stat()).to.eventually.be.rejected()
    })

    it('should remove blocks from the wantlist when requests are cancelled', async () => {
      const controller = new AbortController()
      const cid = new CID('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KaGa')

      const getPromise = ipfsA.dag.get(cid, {
        signal: controller.signal
      })

      await waitForWantlistKey(ipfsA, cid.toString())

      controller.abort()

      await expect(getPromise).to.eventually.be.rejectedWith(/aborted/)

      await waitForWantlistKeyToBeRemoved(ipfsA, cid.toString())
    })

    it('should keep blocks in the wantlist when only one request is cancelled', async () => {
      const controller = new AbortController()
      const otherController = new AbortController()
      const cid = new CID('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1Kaaa')

      const getPromise = ipfsA.dag.get(cid, {
        signal: controller.signal
      })
      const otherGetPromise = ipfsA.dag.get(cid, {
        signal: otherController.signal
      })

      await waitForWantlistKey(ipfsA, cid.toString())

      controller.abort()

      await expect(getPromise).to.eventually.be.rejectedWith(/aborted/)

      await delay(1000)

      // cid should still be in the wantlist
      await waitForWantlistKey(ipfsA, cid.toString())

      otherController.abort()

      await expect(otherGetPromise).to.eventually.be.rejectedWith(/aborted/)

      await waitForWantlistKeyToBeRemoved(ipfsA, cid.toString())
    })
  })
}

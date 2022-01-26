/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { waitForWantlistKey, waitForWantlistKeyToBeRemoved } from './utils.js'
import { isWebWorker } from 'ipfs-utils/src/env.js'
import testTimeout from '../utils/test-timeout.js'
import { CID } from 'multiformats/cid'
import delay from 'delay'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testWantlist (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlist', function () {
    this.timeout(60 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsA
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async () => {
      ipfsA = (await factory.spawn({ type: 'proc', ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(CID.parse(key)).catch(() => { /* is ok, expected on teardown */ })

      const ipfsBId = await ipfsB.id()

      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(() => factory.clean())

    it('should respect timeout option when getting bitswap wantlist', () => {
      return testTimeout(() => ipfsA.bitswap.wantlist({
        timeout: 1
      }))
    })

    it('should get the wantlist', function () {
      return waitForWantlistKey(ipfsB, key)
    })

    it('should not get the wantlist when offline', async () => {
      const node = await factory.spawn()
      await node.stop()

      return expect(node.api.bitswap.stat()).to.eventually.be.rejected()
    })

    it('should remove blocks from the wantlist when requests are cancelled', async () => {
      const controller = new AbortController()
      const cid = CID.parse('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KaGa')

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
      const cid = CID.parse('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1Kaaa')

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

/* eslint-env mocha */

import { getDescribe, getIt } from '../utils/mocha.js'
import { waitForWantlistKey } from './utils.js'
import { isWebWorker } from 'ipfs-utils/src/env.js'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'
import { CID } from 'multiformats/cid'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testWantlistForPeer (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlistForPeer', function () {
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

    it('should get the wantlist by peer ID for a different node', async () => {
      const ipfsBId = await ipfsB.id()

      return waitForWantlistKey(ipfsA, key, {
        peerId: ipfsBId.id,
        timeout: 60 * 1000
      })
    })
  })
}

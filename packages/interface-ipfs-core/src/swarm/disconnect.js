/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isWebWorker } from 'ipfs-utils/src/env.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testDisconnect (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.disconnect', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsA
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsB
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfsBId

    before(async () => {
      ipfsA = (await factory.spawn({ type: 'proc' })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      ipfsBId = await ipfsB.id()
    })

    beforeEach(async () => {
      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(() => factory.clean())

    it('should disconnect from a peer', async () => {
      let peers

      peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length.above(0)

      await ipfsA.swarm.disconnect(ipfsBId.addresses[0])

      peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length(0)
    })
  })
}

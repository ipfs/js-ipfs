/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import { isWebWorker } from 'ipfs-utils/src/env.js'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testPing (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.ping', function () {
    this.timeout(60 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsA
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsB
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let nodeBId

    before(async () => {
      ipfsA = (await factory.spawn({ type: 'proc' })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      nodeBId = await ipfsB.id()
      await ipfsA.swarm.connect(nodeBId.addresses[0])
    })

    after(() => factory.clean())

    it('should send the specified number of packets', async () => {
      const count = 3
      const responses = await all(ipfsA.ping(nodeBId.id, { count }))
      expect(responses.length).to.be.ok()
      expect(responses[0].success).to.be.true()
    })

    it('should fail when pinging a peer that is not available', () => {
      const notAvailablePeerId = peerIdFromString('QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn')
      const count = 2

      return expect(all(ipfsA.ping(notAvailablePeerId, { count }))).to.eventually.be.rejected()
    })

    it('can ping without options', async () => {
      const res = await all(ipfsA.ping(nodeBId.id))
      expect(res.length).to.be.ok()
      expect(res[0].success).to.be.true()
    })
  })
}

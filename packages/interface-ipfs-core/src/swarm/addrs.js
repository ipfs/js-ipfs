/* eslint-env mocha */

import PeerId from 'peer-id'
import { Multiaddr } from 'multiaddr'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isWebWorker } from 'ipfs-utils/src/env.js'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testAddrs (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.addrs', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsA
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfsB
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfsBId

    before(async () => {
      ipfsA = (await factory.spawn({ type: 'proc', ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      ipfsBId = await ipfsB.id()
      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(() => factory.clean())

    it('should get a list of node addresses', async () => {
      const peers = await ipfsA.swarm.addrs()
      expect(peers).to.not.be.empty()
      expect(peers).to.be.an('array')

      for (const peer of peers) {
        expect(PeerId.parse(peer.id)).to.be.ok()
        expect(peer).to.have.a.property('addrs').that.is.an('array')

        for (const ma of peer.addrs) {
          expect(Multiaddr.isMultiaddr(ma)).to.be.true()
        }
      }
    })
  })
}

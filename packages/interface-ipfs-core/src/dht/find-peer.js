/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'
import drain from 'it-drain'
import all from 'it-all'
import { ensureReachable } from './utils.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testFindPeer (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.findPeer', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let nodeA
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeB

    before(async () => {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api

      await ensureReachable(nodeA, nodeB)
    })

    after(() => factory.clean())

    it('should respect timeout option when finding a peer on the DHT', async () => {
      const nodeBId = await nodeB.id()

      await testTimeout(() => drain(nodeA.dht.findPeer(nodeBId.id, {
        timeout: 1
      })))
    })

    it('should find other peers', async () => {
      const nodeBId = await nodeB.id()

      const results = await all(nodeA.dht.findPeer(nodeBId.id))
      const finalPeer = results.filter(event => event.name === 'FINAL_PEER').pop()

      if (!finalPeer || finalPeer.name !== 'FINAL_PEER') {
        throw new Error('No finalPeer event received')
      }

      const id = finalPeer.peer.id
      const nodeAddresses = nodeBId.addresses.map((addr) => addr.nodeAddress())
      const peerAddresses = finalPeer.peer.multiaddrs.map(ma => ma.nodeAddress())

      expect(id).to.equal(nodeBId.id)
      expect(peerAddresses).to.deep.include(nodeAddresses[0])
    })

    it('should fail to find other peer if peer does not exist', async () => {
      const events = await all(nodeA.dht.findPeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'))

      // no finalPeer events found
      expect(events.filter(event => event.name === 'FINAL_PEER')).to.be.empty()

      // queryError events found
      expect(events.filter(event => event.name === 'QUERY_ERROR')).to.not.be.empty()
    })
  })
}

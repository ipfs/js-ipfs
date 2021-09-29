/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'

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
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let nodeBId

    before(async () => {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api
      nodeBId = await nodeB.id()

      await nodeA.swarm.connect(nodeBId.addresses[0])
    })

    after(() => factory.clean())

    it('should respect timeout option when finding a peer on the DHT', async () => {
      const nodeBId = await nodeB.id()

      await testTimeout(() => nodeA.dht.findPeer(nodeBId.id, {
        timeout: 1
      }))
    })

    it('should find other peers', async () => {
      const nodeBId = await nodeB.id()
      const res = await nodeA.dht.findPeer(nodeBId.id)
      const id = res.id.toString()

      const nodeAddresses = nodeBId.addresses.map((addr) => addr.nodeAddress())
      const peerAddresses = res.addrs.map(ma => ma.nodeAddress())

      expect(id).to.be.eql(nodeBId.id)
      expect(peerAddresses).to.deep.include(nodeAddresses[0])
    })

    it('should fail to find other peer if peer does not exist', () => {
      return expect(nodeA.dht.findPeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')).to.eventually.be.rejected()
    })
  })
}

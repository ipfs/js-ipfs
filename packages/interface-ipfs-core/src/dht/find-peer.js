/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.findPeer', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = (await common.spawn()).api
      nodeB = (await common.spawn()).api
      await nodeB.swarm.connect(nodeA.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should find other peers', async () => {
      const nodeBId = await nodeB.id()
      const res = await nodeA.dht.findPeer(nodeBId.id)
      const id = res.id.toString()

      const nodeAddresses = nodeBId.addresses.map((addr) => addr.nodeAddress())
      const peerAddresses = res.addrs.map(ma => ma.nodeAddress())

      expect(id).to.be.eql(nodeB.peerId.id)
      expect(peerAddresses).to.deep.include(nodeAddresses[0])
    })

    it('should fail to find other peer if peer does not exist', () => {
      return expect(nodeA.dht.findPeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')).to.eventually.be.rejected()
    })
  })
}

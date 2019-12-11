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
      const res = await nodeA.dht.findPeer(nodeB.peerId.id)

      const id = res.id.toB58String()
      const nodeAddresses = nodeB.peerId.addresses.map((addr) => addr.split('/ipfs/')[0]) // remove '/ipfs/'
      const peerAddresses = res.multiaddrs.toArray().map((ma) => ma.toString().split('/ipfs/')[0])

      expect(id).to.be.eql(nodeB.peerId.id)
      expect(nodeAddresses).to.include(peerAddresses[0])
    })

    it('should fail to find other peer if peer does not exist', () => {
      return expect(nodeA.dht.findPeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')).to.eventually.be.rejected()
    })
  })
}

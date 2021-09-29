/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { Multiaddr } from 'multiaddr'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testClear (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  const validIp4 = new Multiaddr('/ip4/104.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z')

  describe('.bootstrap.clear', function () {
    this.timeout(100 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should return a list containing the peer removed when called with a valid arg (ip4)', async () => {
      await ipfs.bootstrap.clear()

      const addRes = await ipfs.bootstrap.add(validIp4)
      expect(addRes).to.be.eql({ Peers: [validIp4] })

      const rmRes = await ipfs.bootstrap.clear()
      expect(rmRes).to.be.eql({ Peers: [validIp4] })

      const peers = rmRes.Peers
      expect(peers).to.have.property('length').that.is.equal(1)
    })

    it('should return a list of all peers removed when all option is passed', async () => {
      const addRes = await ipfs.bootstrap.reset()
      const addedPeers = addRes.Peers

      const rmRes = await ipfs.bootstrap.clear()
      const removedPeers = rmRes.Peers

      expect(removedPeers.sort()).to.deep.equal(addedPeers.sort())

      expect(removedPeers.every(ma => Multiaddr.isMultiaddr(ma))).to.be.true()
    })
  })
}

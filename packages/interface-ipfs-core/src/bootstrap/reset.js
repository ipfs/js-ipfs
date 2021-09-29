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
export function testReset (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bootstrap.reset', function () {
    this.timeout(100 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should return a list of bootstrap peers when resetting the bootstrap nodes', async () => {
      const res = await ipfs.bootstrap.reset()

      const peers = res.Peers
      expect(peers).to.have.property('length').that.is.gt(1)
    })

    it('should return a list of all peers removed when all option is passed', async () => {
      const addRes = await ipfs.bootstrap.reset()
      const addedPeers = addRes.Peers

      const rmRes = await ipfs.bootstrap.clear()
      const removedPeers = rmRes.Peers

      expect(removedPeers.sort()).to.deep.equal(addedPeers.sort())
      expect(addedPeers.every(ma => Multiaddr.isMultiaddr(ma))).to.be.true()
    })
  })
}

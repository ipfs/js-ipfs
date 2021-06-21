/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { Multiaddr } = require('multiaddr')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bootstrap.reset', function () {
    this.timeout(100 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

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

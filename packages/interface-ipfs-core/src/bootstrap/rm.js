/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  const invalidArg = 'this/Is/So/Invalid/'
  const validIp4 = '/ip4/104.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'

  describe('.bootstrap.rm', function () {
    this.timeout(100 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should respect timeout option when removing bootstrap nodes', () => {
      return testTimeout(() => ipfs.bootstrap.rm(validIp4, {
        timeout: 1
      }))
    })

    it('should return an error when called with an invalid arg', () => {
      return expect(ipfs.bootstrap.rm(invalidArg)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return an empty list because no peers removed when called without an arg or options', async () => {
      const res = await ipfs.bootstrap.rm(null)

      const peers = res.Peers
      expect(peers).to.have.property('length').that.is.equal(0)
    })

    it('should return a list containing the peer removed when called with a valid arg (ip4)', async () => {
      const addRes = await ipfs.bootstrap.add(validIp4)
      expect(addRes).to.be.eql({ Peers: [validIp4] })

      const rmRes = await ipfs.bootstrap.rm(validIp4)
      expect(rmRes).to.be.eql({ Peers: [validIp4] })

      const peers = rmRes.Peers
      expect(peers).to.have.property('length').that.is.equal(1)
    })

    it('should return a list of all peers removed when all option is passed', async () => {
      const addRes = await ipfs.bootstrap.add(null, { default: true })
      const addedPeers = addRes.Peers

      const rmRes = await ipfs.bootstrap.rm(null, { all: true })
      const removedPeers = rmRes.Peers

      expect(removedPeers).to.eql(addedPeers)
    })
  })
}

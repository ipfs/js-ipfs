/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const Multiaddr = require('multiaddr')

const invalidArg = 'this/Is/So/Invalid/'
const validIp4 = new Multiaddr('/ip4/104.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bootstrap.add', function () {
    this.timeout(100 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when adding bootstrap nodes', () => {
      return testTimeout(() => ipfs.bootstrap.add(validIp4, {
        timeout: 1
      }))
    })

    it('should return an error when called with an invalid arg', () => {
      return expect(ipfs.bootstrap.add(invalidArg)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return a list containing the bootstrap peer when called with a valid arg (ip4)', async () => {
      const res = await ipfs.bootstrap.add(validIp4)

      expect(res).to.be.eql({ Peers: [validIp4] })
      const peers = res.Peers
      expect(peers).to.have.property('length').that.is.equal(1)
    })

    it('should prevent duplicate inserts of bootstrap peers', async () => {
      await ipfs.bootstrap.clear()

      const added = await ipfs.bootstrap.add(validIp4)
      expect(added).to.have.property('Peers').that.deep.equals([validIp4])

      const addedAgain = await ipfs.bootstrap.add(validIp4)
      expect(addedAgain).to.have.property('Peers').that.deep.equals([validIp4])

      const list = await ipfs.bootstrap.list()
      expect(list).to.have.property('Peers').that.deep.equals([validIp4])
    })

    it('add a peer to the bootstrap list', async () => {
      const peer = new Multiaddr('/ip4/111.111.111.111/tcp/1001/p2p/QmXFX2P5ammdmXQgfqGkfswtEVFsZUJ5KeHRXQYCTdiTAb')

      const res = await ipfs.bootstrap.add(peer)
      expect(res).to.be.eql({ Peers: [peer] })

      const list = await ipfs.bootstrap.list()
      expect(list.Peers).to.deep.include(peer)

      expect(list.Peers.every(ma => Multiaddr.isMultiaddr(ma))).to.be.true()
    })
  })
}

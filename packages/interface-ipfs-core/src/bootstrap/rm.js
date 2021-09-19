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
export function testRm (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  const invalidArg = 'this/Is/So/Invalid/'
  const validIp4 = new Multiaddr('/ip4/104.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z')

  describe('.bootstrap.rm', function () {
    this.timeout(100 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should return an error when called with an invalid arg', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.bootstrap.rm(invalidArg)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return a list containing the peer removed when called with a valid arg (ip4)', async () => {
      const addRes = await ipfs.bootstrap.add(validIp4)
      expect(addRes).to.be.eql({ Peers: [validIp4] })

      const rmRes = await ipfs.bootstrap.rm(validIp4)
      expect(rmRes).to.be.eql({ Peers: [validIp4] })

      const peers = rmRes.Peers
      expect(peers).to.have.property('length').that.is.equal(1)
    })

    it('removes a peer from the bootstrap list', async () => {
      const peer = new Multiaddr('/ip4/111.111.111.111/tcp/1001/p2p/QmXFX2P5ammdmXQgfqGkfswtEVFsZUJ5KeHRXQYCTdiTAb')
      await ipfs.bootstrap.add(peer)
      let list = await ipfs.bootstrap.list()
      expect(list.Peers).to.deep.include(peer)

      const res = await ipfs.bootstrap.rm(peer)
      expect(res).to.be.eql({ Peers: [peer] })

      list = await ipfs.bootstrap.list()
      expect(list.Peers).to.not.deep.include(peer)
      expect(res.Peers.every(ma => Multiaddr.isMultiaddr(ma))).to.be.true()
    })
  })
}

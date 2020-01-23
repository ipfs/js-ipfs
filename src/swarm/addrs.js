/* eslint-env mocha */
'use strict'

const CID = require('cids')
const Multiaddr = require('multiaddr')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.addrs', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = (await common.spawn()).api
      ipfsB = (await common.spawn({ type: 'js' })).api
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should get a list of node addresses', async () => {
      const peerInfos = await ipfsA.swarm.addrs()
      expect(peerInfos).to.not.be.empty()
      expect(peerInfos).to.be.an('array')
      peerInfos.forEach(m => {
        expect(CID.isCID(m.id)).to.be.true()
        m.addrs.forEach(addr => expect(Multiaddr.isMultiaddr(addr)).to.be.true())
      })
    })
  })
}

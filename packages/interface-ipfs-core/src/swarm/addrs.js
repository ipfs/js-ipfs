/* eslint-env mocha */
'use strict'

const CID = require('cids')
const Multiaddr = require('multiaddr')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isWebWorker } = require('ipfs-utils/src/env')

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
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should get a list of node addresses', async () => {
      const peers = await ipfsA.swarm.addrs()
      expect(peers).to.not.be.empty()
      expect(peers).to.be.an('array')

      for (const peer of peers) {
        expect(CID.isCID(new CID(peer.id))).to.be.true()
        expect(peer).to.have.a.property('addrs').that.is.an('array')

        for (const ma of peer.addrs) {
          expect(Multiaddr.isMultiaddr(ma)).to.be.true()
        }
      }
    })
  })
}

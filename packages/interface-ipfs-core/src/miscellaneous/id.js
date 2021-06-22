/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { Multiaddr } = require('multiaddr')
const CID = require('cids')
const { isWebWorker } = require('ipfs-utils/src/env')
const retry = require('p-retry')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.id', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get the node ID', async () => {
      const res = await ipfs.id()
      expect(res).to.have.a.property('id').that.is.a('string')
      expect(CID.isCID(new CID(res.id))).to.equal(true)
      expect(res).to.have.a.property('publicKey')
      expect(res).to.have.a.property('agentVersion').that.is.a('string')
      expect(res).to.have.a.property('protocolVersion').that.is.a('string')
      expect(res).to.have.a.property('addresses').that.is.an('array')

      for (const ma of res.addresses) {
        expect(Multiaddr.isMultiaddr(ma)).to.be.true()
      }
    })

    it('should have protocols property', async () => {
      const res = await ipfs.id()

      expect(res).to.have.a.property('protocols').that.is.an('array')

      expect(res.protocols).to.have.members([
        '/floodsub/1.0.0',
        '/ipfs/bitswap/1.0.0',
        '/ipfs/bitswap/1.1.0',
        '/ipfs/bitswap/1.2.0',
        '/ipfs/id/1.0.0',
        '/ipfs/id/push/1.0.0',
        '/ipfs/ping/1.0.0',
        '/libp2p/circuit/relay/0.1.0',
        '/meshsub/1.0.0',
        '/meshsub/1.1.0'
      ])
    })

    it('should return swarm ports opened after startup', async function () {
      if (isWebWorker) {
        // TODO: webworkers are not currently dialable
        return this.skip()
      }

      await expect(ipfs.id()).to.eventually.have.property('addresses').that.is.not.empty()
    })

    it('should get the id of another node in the swarm', async function () {
      if (isWebWorker) {
        // TODO: https://github.com/libp2p/js-libp2p-websockets/issues/129
        return this.skip()
      }

      const ipfsB = (await common.spawn()).api
      await ipfs.swarm.connect(ipfsB.peerId.addresses[0])

      // have to wait for identify to complete before protocols etc are available for remote hosts
      await retry(async () => {
        const result = await ipfs.id({
          peerId: ipfsB.peerId.id
        })

        expect(result).to.deep.equal(ipfsB.peerId)
      }, { retries: 5 })
    })

    it('should get our own id when passed as an option', async function () {
      const res = await ipfs.id()

      const result = await ipfs.id({
        peerId: res.id
      })

      expect(result).to.deep.equal(res)
    })
  })
}

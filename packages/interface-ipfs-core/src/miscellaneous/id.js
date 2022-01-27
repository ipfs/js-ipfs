/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { Multiaddr } from 'multiaddr'
import { isWebWorker } from 'ipfs-utils/src/env.js'
import retry from 'p-retry'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testId (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.id', function () {
    // @ts-ignore this is mocha
    this.timeout(60 * 1000)
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get the node ID', async () => {
      const res = await ipfs.id()
      expect(res).to.have.a.property('id').that.is.a('string')
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

      expect(res.protocols).to.include.members([
        '/floodsub/1.0.0',
        '/ipfs/bitswap/1.0.0',
        '/ipfs/bitswap/1.1.0',
        '/ipfs/bitswap/1.2.0',
        '/ipfs/id/1.0.0',
        '/ipfs/id/push/1.0.0',
        '/ipfs/lan/kad/1.0.0',
        '/ipfs/ping/1.0.0',
        '/libp2p/circuit/relay/0.1.0',
        '/meshsub/1.0.0',
        '/meshsub/1.1.0'
      ])
    })

    it('should return swarm ports opened after startup', async function () {
      if (isWebWorker) {
        // TODO: webworkers are not currently dialable
        // @ts-ignore this is mocha
        return this.skip()
      }

      await expect(ipfs.id()).to.eventually.have.property('addresses').that.is.not.empty()
    })

    it('should get the id of another node in the swarm', async function () {
      if (isWebWorker) {
        // TODO: https://github.com/libp2p/js-libp2p-websockets/issues/129
        // @ts-ignore this is mocha
        return this.skip()
      }

      const ipfsB = (await factory.spawn()).api
      const ipfsBId = await ipfsB.id()
      await ipfs.swarm.connect(ipfsBId.addresses[0])

      // have to wait for identify to complete before protocols etc are available for remote hosts
      await retry(async () => {
        const result = await ipfs.id({
          peerId: ipfsBId.id
        })

        expect(result).to.deep.equal(ipfsBId)
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

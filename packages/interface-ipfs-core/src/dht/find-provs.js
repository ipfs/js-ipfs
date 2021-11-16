/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import drain from 'it-drain'
import { fakeCid } from './utils.js'
import testTimeout from '../utils/test-timeout.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testFindProvs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.findProvs', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let nodeA
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeB
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeC
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let nodeAId
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let nodeBId
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let nodeCId

    before(async () => {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api
      nodeC = (await factory.spawn()).api

      nodeAId = await nodeA.id()
      nodeBId = await nodeB.id()
      nodeCId = await nodeC.id()

      await Promise.all([
        nodeB.swarm.connect(nodeAId.addresses[0]),
        nodeC.swarm.connect(nodeBId.addresses[0])
      ])
    })

    after(() => factory.clean())

    /**
     * @type {import('multiformats/cid').CID}
     */
    let providedCid
    before('add providers for the same cid', async function () {
      const cids = await Promise.all([
        nodeB.object.new('unixfs-dir'),
        nodeC.object.new('unixfs-dir')
      ])

      providedCid = cids[0]

      await Promise.all([
        all(nodeB.dht.provide(providedCid)),
        all(nodeC.dht.provide(providedCid))
      ])
    })

    it('should respect timeout option when finding providers on the DHT', () => {
      return testTimeout(() => drain(nodeA.dht.findProvs(providedCid, {
        timeout: 1
      })))
    })

    it('should be able to find providers', async function () {
      /** @type {string[]} */
      const providerIds = []

      for await (const event of nodeA.dht.findProvs(providedCid)) {
        if (event.name === 'PROVIDER') {
          providerIds.push(...event.providers.map(prov => prov.id))
        }
      }

      expect(providerIds).to.include(nodeBId.id)
      expect(providerIds).to.include(nodeCId.id)
    })

    it('should take options to override timeout config', async function () {
      const options = {
        timeout: 1
      }

      const cidV0 = await fakeCid()
      const start = Date.now()
      let res

      try {
        res = await all(nodeA.dht.findProvs(cidV0, options))
      } catch (/** @type {any} */ err) {
        // rejected by http client
        expect(err).to.have.property('name', 'TimeoutError')
        return
      }

      // rejected by the server, errors don't work over http - https://github.com/ipfs/js-ipfs/issues/2519
      expect(res).to.be.an('array').with.lengthOf(0)
      expect(Date.now() - start).to.be.lessThan(100)
    })
  })
}

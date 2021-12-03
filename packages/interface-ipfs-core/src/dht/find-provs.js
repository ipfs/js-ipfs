/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import drain from 'it-drain'
import testTimeout from '../utils/test-timeout.js'
import { ensureReachable } from './utils.js'

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

    before(async () => {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api
      nodeC = (await factory.spawn()).api

      await ensureReachable(nodeB, nodeA)
      await ensureReachable(nodeC, nodeB)
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

      const nodeBId = await nodeB.id()
      const nodeCId = await nodeC.id()

      expect(providerIds).to.include(nodeBId.id)
      expect(providerIds).to.include(nodeCId.id)
    })
  })
}

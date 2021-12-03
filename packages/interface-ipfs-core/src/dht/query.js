/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
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
export function testQuery (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.query', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let nodeA
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeB

    before(async () => {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api

      await ensureReachable(nodeA, nodeB)
    })

    after(() => factory.clean())

    it('should respect timeout option when querying the DHT', async () => {
      const nodeBId = await nodeB.id()

      return testTimeout(() => drain(nodeA.dht.query(nodeBId.id, {
        timeout: 1
      })))
    })

    it('should return the other node in the query', async function () {
      /** @type {string[]} */
      const peers = []
      const nodeBId = await nodeB.id()

      for await (const event of nodeA.dht.query(nodeBId.id)) {
        if (event.name === 'PEER_RESPONSE') {
          peers.push(...event.closer.map(data => data.id))
        }
      }

      expect(peers).to.include(nodeBId.id)
    })
  })
}

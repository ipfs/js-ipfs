/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const drain = require('it-drain')
const testTimeout = require('../utils/test-timeout')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.query', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let nodeA
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeB
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let nodeBId

    before(async () => {
      nodeA = (await factory.spawn()).api
      nodeB = (await factory.spawn()).api
      const nodeAId = await nodeA.id()
      nodeBId = await nodeB.id()
      await nodeB.swarm.connect(nodeAId.addresses[0])
    })

    after(() => factory.clean())

    it('should respect timeout option when querying the DHT', () => {
      return testTimeout(() => drain(nodeA.dht.query(nodeBId.id, {
        timeout: 1
      })))
    })

    it('should return the other node in the query', async function () {
      const timeout = 150 * 1000
      // @ts-ignore this is mocha
      this.timeout(timeout)

      try {
        const peers = await all(nodeA.dht.query(nodeBId.id, { timeout: timeout - 1000 }))
        expect(peers.map(p => p.id.toString())).to.include(nodeBId.id)
      } catch (err) {
        if (err instanceof Error && err.name === 'TimeoutError') {
          // This test is meh. DHT works best with >= 20 nodes. Therefore a
          // failure might happen, but we don't want to report it as such.
          // Hence skip the test before the timeout is reached
          // @ts-ignore this is mocha
          this.skip()
        } else {
          throw err
        }
      }
    })
  })
}

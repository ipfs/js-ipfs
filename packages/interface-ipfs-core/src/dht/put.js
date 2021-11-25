/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testPut (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.put', function () {
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
      nodeBId = await nodeB.id()

      console.info(nodeBId.addresses.map(addr => addr.toString())) // eslint-disable-line no-console

      await nodeA.swarm.connect(nodeBId.addresses[0])
    })

    after(() => factory.clean())

    it.only('should put a value to the DHT', async function () { // eslint-disable-line no-only-tests/no-only-tests
      const { cid } = await nodeA.add('should put a value to the DHT')

      const publish = await nodeA.name.publish(cid)
      let record

      for await (const event of nodeA.dht.get(`/ipns/${publish.name}`)) {
        if (event.name === 'VALUE') {
          record = event.value
          break
        }
      }

      if (!record) {
        throw new Error('Could not find value')
      }

      const events = await all(nodeA.dht.put(`/ipns/${publish.name}`, record, { verbose: true }))
      const peerResponse = events.filter(event => event.name === 'PEER_RESPONSE').pop()

      if (!peerResponse || peerResponse.name !== 'PEER_RESPONSE') {
        throw new Error('Did not get peer response')
      }

      expect(peerResponse.from).to.be.equal(nodeBId.id)
    })
  })
}

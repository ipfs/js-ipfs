/* eslint-env mocha */


import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt }  from '../utils/mocha.js'
import all from 'it-all'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

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

      await nodeA.swarm.connect(nodeBId.addresses[0])
    })

    after(() => factory.clean())

    it('should put a value to the DHT', async function () {
      const { cid } = await nodeA.add('should put a value to the DHT')
      const publish = await nodeA.name.publish(cid)
      const record = await nodeA.dht.get(uint8ArrayFromString(`/ipns/${publish.name}`))
      const value = await all(nodeA.dht.put(uint8ArrayFromString(`/ipns/${publish.name}`), record, { verbose: true }))
      expect(value).to.has.length(3)
      expect(value[2].id.toString()).to.be.equal(nodeBId.id)
      expect(value[2].type).to.be.equal(5)
    })
  })
}

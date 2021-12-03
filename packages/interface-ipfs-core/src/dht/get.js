/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import drain from 'it-drain'
import all from 'it-all'
import { ensureReachable } from './utils.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testGet (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.get', function () {
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

    it('should respect timeout option when getting a value from the DHT', async () => {
      const data = await nodeA.add('should put a value to the DHT')
      const publish = await nodeA.name.publish(data.cid)

      await testTimeout(() => drain(nodeB.dht.get(`/ipns/${publish.name}`, {
        timeout: 1
      })))
    })

    it('should error when getting a non-existent key from the DHT', async () => {
      const key = '/ipns/k51qzi5uqu5dl0dbfddy2wb42nvbc6anyxnkrguy5l0h0bv9kaih6j6vqdskqk'
      const events = await all(nodeA.dht.get(key))

      // no value events found
      expect(events.filter(event => event.name === 'VALUE')).to.be.empty()

      // queryError events found
      expect(events.filter(event => event.name === 'QUERY_ERROR')).to.not.be.empty()
    })

    it('should get a value after it was put on another node', async () => {
      const data = await nodeA.add('should put a value to the DHT')
      const publish = await nodeA.name.publish(data.cid)
      const events = await all(nodeA.dht.get(`/ipns/${publish.name}`))
      const valueEvent = events.filter(event => event.name === 'VALUE').pop()

      if (!valueEvent || valueEvent.name !== 'VALUE') {
        throw new Error('Value event not found')
      }

      expect(uint8ArrayToString(valueEvent.value)).to.contain(data.cid.toString())
    })
  })
}

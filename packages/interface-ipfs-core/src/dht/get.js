/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const { fromString: uint8ArrayToString } = require('uint8arrays/from-string')
const { toString: uint8ArrayFromString } = require('uint8arrays/to-string')

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

  describe('.dht.get', function () {
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

    it('should respect timeout option when getting a value from the DHT', async () => {
      const data = await nodeA.add('should put a value to the DHT')
      const publish = await nodeA.name.publish(data.cid)

      await testTimeout(() => nodeB.dht.get(uint8ArrayFromString(`/ipns/${publish.name}`), {
        timeout: 1
      }))
    })

    it('should error when getting a non-existent key from the DHT', () => {
      return expect(nodeA.dht.get(uint8ArrayFromString('non-existing'), { timeout: 100 }))
        .to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should get a value after it was put on another node', async () => {
      const data = await nodeA.add('should put a value to the DHT')
      const publish = await nodeA.name.publish(data.cid)
      const record = await nodeA.dht.get(uint8ArrayFromString(`/ipns/${publish.name}`))

      expect(uint8ArrayToString(record)).to.contain(data.cid.toString())
    })
  })
}

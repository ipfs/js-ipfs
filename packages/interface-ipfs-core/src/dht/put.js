/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const all = require('it-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.put', function () {
    let nodeA
    let nodeB

    before(async () => {
      nodeA = (await common.spawn()).api
      nodeB = (await common.spawn()).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should respect timeout option when putting a value into the DHT', async () => {
      const { cid } = await nodeA.add('should respect timeout option when putting a value into the DH')
      const publish = await nodeA.name.publish(cid)
      const record = await nodeA.dht.get(`/ipns/${publish.name}`)

      await testTimeout(() => nodeA.dht.put(`/ipns/${publish.name}`, record, {
        timeout: 1
      }))
    })

    it('should put a value to the DHT', async function () {
      const { cid } = await nodeA.add('should put a value to the DHT')
      const publish = await nodeA.name.publish(cid)
      const record = await nodeA.dht.get(`/ipns/${publish.name}`)
      const value = await all(nodeA.dht.put(`/ipns/${publish.name}`, record, { verbose: true }))
      expect(value).to.has.length(3)
      expect(value[2].id.toString()).to.be.equal(nodeB.peerId.id)
      expect(value[2].type).to.be.equal(5)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const drain = require('it-drain')
const all = require('it-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.get', function () {
    let nodeA
    let nodeB

    before(async () => {
      nodeA = (await common.spawn()).api
      nodeB = (await common.spawn()).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should respect timeout option when getting a value from the DHT', async () => {
      const key = Buffer.from('/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      const data = Buffer.from('data')

      await drain(nodeA.dht.put(key, data, { verbose: true }))

      await testTimeout(() => nodeB.dht.get(key, {
        timeout: 1
      }))
    })

    it('should error when getting a non-existent key from the DHT', () => {
      return expect(nodeA.dht.get('non-existing', { timeout: 100 })).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should get a value after it was put on another node', async () => {
      const [data] = await all(nodeA.add('should put a value to the DHT'))
      const publish = await nodeA.name.publish(data.cid)
      const record = await nodeA.dht.get(`/ipns/${publish.name}`)

      expect(record.toString()).to.contain(data.cid.toString())
    })
  })
}

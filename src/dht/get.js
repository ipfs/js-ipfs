/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.get', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = (await common.spawn()).api
      nodeB = (await common.spawn()).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should error when getting a non-existent key from the DHT', () => {
      return expect(nodeA.dht.get('non-existing', { timeout: 100 })).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    // TODO: revisit this test - it puts an invalid key and so go-ipfs throws
    // "invalid record keytype" - it needs to put a valid key and value for it to
    // be a useful test.
    it.skip('should get a value after it was put on another node', async () => {
      const key = Buffer.from(hat())
      const value = Buffer.from(hat())

      await nodeB.dht.put(key, value)
      const result = await nodeA.dht.get(key)

      expect(result).to.eql(value)
    })
  })
}

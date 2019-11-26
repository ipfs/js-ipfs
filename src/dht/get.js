/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.get', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = await common.setup()
      nodeB = await common.setup()
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should error when getting a non-existent key from the DHT', () => {
      return expect(nodeA.dht.get('non-existing', { timeout: 100 })).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should get a value after it was put on another node', async () => {
      const key = Buffer.from(hat())
      const value = Buffer.from(hat())

      await nodeB.dht.put(key, value)
      const result = await nodeA.dht.get(key)

      expect(result).to.eql(value)
    })
  })
}

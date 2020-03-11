/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')
const all = require('it-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe.skip('.dht.put', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = (await common.spawn()).api
      nodeB = (await common.spawn()).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should put a value to the DHT', async function () {
      this.timeout(80 * 1000)

      const key = Buffer.from('/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      const data = Buffer.from('data')

      await all(nodeA.dht.put(key, data, { verbose: true }))

      // await nodeA.dht.put(key, data)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const { getDescribe, getIt } = require('../utils/mocha')
const drain = require('it-drain')
const testTimeout = require('../utils/test-timeout')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  // TODO unskip this after go-ipfs 0.5.0 ships interface is going to change
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

    it('should respect timeout option when putting a value into the DHT', () => {
      return testTimeout(() => nodeA.dht.put(new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'), Buffer.from('derp'), {
        timeout: 1
      }))
    })

    it('should put a value to the DHT', async function () {
      this.timeout(80 * 1000)

      const key = Buffer.from('/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      const data = Buffer.from('data')

      await drain(nodeA.dht.put(key, data, { verbose: true }))
    })
  })
}

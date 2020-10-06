/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('disabled', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = (await factory.spawn({
        ipfsOptions: {
          config: {
            Routing: {
              Type: 'none'
            }
          }
        }
      })).api
      nodeB = (await factory.spawn()).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => factory.clean())

    it('should error when DHT not available', async () => {
      await expect(nodeA.dht.get('/ipns/Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh'))
        .to.eventually.be.rejected()
    })
  })
}

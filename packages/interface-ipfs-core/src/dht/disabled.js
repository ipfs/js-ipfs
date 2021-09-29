/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testDisabled (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('disabled', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let nodeA
    /** @type {import('ipfs-core-types').IPFS} */
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
      const nodeBId = await nodeB.id()
      await nodeA.swarm.connect(nodeBId.addresses[0])
    })

    after(() => factory.clean())

    it('should error when DHT not available', async () => {
      await expect(nodeA.dht.get(uint8ArrayFromString('/ipns/Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh')))
        .to.eventually.be.rejected()
    })
  })
}

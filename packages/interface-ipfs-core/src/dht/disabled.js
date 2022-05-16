/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
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
      await expect(all(nodeA.dht.put('/ipns/12D3KooWBD9zgsogrYf1dum1TwTwe6k5xT8acGZ5PNeYmKf72qz2', uint8ArrayFromString('hello'), { verbose: true })))
        .to.eventually.be.rejected()
    })
  })
}

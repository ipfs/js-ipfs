/* eslint-env mocha */

import { expectIsBandwidth } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import last from 'it-last'
import all from 'it-all'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testBw (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bw', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get bandwidth stats ', async () => {
      const res = await last(ipfs.stats.bw())

      if (!res) {
        throw new Error('No bw stats returned')
      }

      expectIsBandwidth(null, res)
    })

    it('should throw error for invalid interval option', async () => {
      await expect(all(ipfs.stats.bw({ poll: true, interval: 'INVALID INTERVAL' })))
        .to.eventually.be.rejected()
        .with.property('message').that.matches(/invalid duration/)
    })
  })
}

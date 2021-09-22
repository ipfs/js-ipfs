/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { expectIsBitswap } from '../stats/utils.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testStat (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.stat', function () {
    this.timeout(60 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get bitswap stats', async () => {
      const res = await ipfs.bitswap.stat()
      expectIsBitswap(null, res)
    })

    it('should not get bitswap stats when offline', async () => {
      const node = await factory.spawn()
      await node.stop()

      return expect(node.api.bitswap.stat()).to.eventually.be.rejected()
    })
  })
}

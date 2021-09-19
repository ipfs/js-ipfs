/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testUnwant (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.unwant', function () {
    this.timeout(60 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should throw error for invalid CID input', async () => {
      // @ts-expect-error input is invalid
      await expect(ipfs.bitswap.unwant('INVALID CID')).to.eventually.be.rejected()
    })
  })
}

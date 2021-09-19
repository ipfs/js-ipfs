/* eslint-env mocha */

import { expectIsRepo } from '../stats/utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'

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

  describe('.repo.stat', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get repo stats', async () => {
      const res = await ipfs.repo.stat()
      expectIsRepo(null, res)
    })
  })
}

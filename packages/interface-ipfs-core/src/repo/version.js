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
export function testVersion (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.repo.version', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get the repo version', async () => {
      const version = await ipfs.repo.version()
      expect(version).to.exist()
    })
  })
}

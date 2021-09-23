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

  describe('.version', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get the node version', async () => {
      const result = await ipfs.version()
      expect(result).to.have.a.property('version')
      expect(result).to.have.a.property('commit')
      expect(result).to.have.a.property('repo')
    })

    it('should include the ipfs-http-client version', async () => {
      const result = await ipfs.version()
      expect(result).to.have.a.property('ipfs-http-client')
    })

    it('should include the interface-ipfs-core version', async () => {
      const result = await ipfs.version()
      expect(result).to.have.a.property('interface-ipfs-core')
    })
  })
}

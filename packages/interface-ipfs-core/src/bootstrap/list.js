/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isMultiaddr } from '@multiformats/multiaddr'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testList (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bootstrap.list', function () {
    this.timeout(100 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should return a list of peers', async () => {
      const res = await ipfs.bootstrap.list()

      const peers = res.Peers
      expect(peers).to.be.an('Array')
      expect(peers.every(ma => isMultiaddr(ma))).to.be.true()
    })
  })
}

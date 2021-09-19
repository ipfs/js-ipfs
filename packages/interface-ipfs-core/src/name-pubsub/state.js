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
export function testState (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.state', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get the current state of pubsub', async function () {
      // @ts-ignore this is mocha
      this.timeout(50 * 1000)

      const res = await ipfs.name.pubsub.state()
      expect(res).to.exist()
      expect(res).to.have.property('enabled')
      expect(res.enabled).to.be.eql(true)
    })
  })
}

/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isWebWorker } from 'ipfs-utils/src/env.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testLocalAddrs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should list local addresses the node is listening on', async () => {
      const multiaddrs = await ipfs.swarm.localAddrs()

      expect(multiaddrs).to.be.an.instanceOf(Array)

      if (isWebWorker && factory.opts.type === 'proc') {
        expect(multiaddrs).to.have.lengthOf(0)
      } else {
        expect(multiaddrs).to.not.be.empty()
      }
    })
  })
}

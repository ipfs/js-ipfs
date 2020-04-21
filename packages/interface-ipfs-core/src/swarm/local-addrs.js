/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isWebWorker } = require('ipfs-utils/src/env')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when listing local addresses', () => {
      return testTimeout(() => ipfs.swarm.localAddrs({
        timeout: 1
      }))
    })

    it('should list local addresses the node is listening on', async () => {
      const multiaddrs = await ipfs.swarm.localAddrs()

      expect(multiaddrs).to.be.an.instanceOf(Array)

      if (isWebWorker && common.opts.type === 'proc') {
        expect(multiaddrs).to.have.lengthOf(0)
      } else {
        expect(multiaddrs).to.not.be.empty()
      }
    })
  })
}

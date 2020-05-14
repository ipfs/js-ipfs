/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stop', function () {
    this.timeout(60 * 1000)
    let ipfs

    beforeEach(async () => {
      ipfs = await common.spawn()
    })

    afterEach(() => {
      // reset the list of controlled nodes - we've already shut down the
      // nodes started in this test but the references hang around and the
      // next test will call `common.clean()` which will explode when it
      // can't connect to the nodes started by this test.
      common.controllers = []
    })

    it('should respect timeout option when stopping the node', () => {
      return testTimeout(() => ipfs.api.stop({
        timeout: 1
      }))
    })

    it('should stop the node', async () => {
      // Should succeed because node is started
      await ipfs.api.swarm.peers()

      // Stop the node and try the call again
      await ipfs.api.stop()

      // Trying to use an API that requires a started node should return an error
      return expect(ipfs.api.swarm.peers()).to.eventually.be.rejected()
    })
  })
}

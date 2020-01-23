/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

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

    it('should stop the node', async () => {
      const ipfs = await common.spawn()

      // Should succeed because node is started
      await ipfs.api.swarm.peers()

      // Stop the node and try the call again
      await ipfs.stop()

      // Trying to use an API that requires a started node should return an error
      return expect(ipfs.api.swarm.peers()).to.eventually.be.rejected()
    })
  })
}

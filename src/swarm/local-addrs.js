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

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should list local addresses the node is listening on', async () => {
      const multiaddrs = await ipfs.swarm.localAddrs()
      // js-ipfs in the browser will have zero
      expect(Array.isArray(multiaddrs)).to.be.true()
    })
  })
}

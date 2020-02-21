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

  describe('.bootstrap.list', function () {
    this.timeout(100 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should return a list of peers', async () => {
      const res = await ipfs.bootstrap.list()

      const peers = res.Peers
      expect(peers).to.exist()
    })
  })
}

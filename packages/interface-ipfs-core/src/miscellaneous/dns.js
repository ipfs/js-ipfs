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

  describe('.dns', function () {
    this.timeout(60 * 1000)
    this.retries(3)
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should non-recursively resolve ipfs.io', async () => {
      const res = await ipfs.dns('ipfs.io', { recursive: false })

      // matches pattern /ipns/<ipnsaddress>
      expect(res).to.match(/\/ipns\/.+$/)
    })

    it('should recursively resolve ipfs.io', async () => {
      const res = await ipfs.dns('ipfs.io', { recursive: true })

      // matches pattern /ipfs/<hash>
      expect(res).to.match(/\/ipfs\/.+$/)
    })

    it('should resolve subdomain docs.ipfs.io', async () => {
      const res = await ipfs.dns('docs.ipfs.io')

      // matches pattern /ipfs/<hash>
      expect(res).to.match(/\/ipfs\/.+$/)
    })
  })
}

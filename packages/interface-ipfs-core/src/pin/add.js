/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.add', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api
      await Promise.all(fixtures.files.map(file => {
        return ipfs.add(file.data, { pin: false })
      }))
    })

    after(() => common.clean())

    it('should respect timeout option when pinning a block', () => {
      return testTimeout(() => ipfs.pin.add(new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'), {
        timeout: 1
      }))
    })

    it('should add a pin', async () => {
      const pinset = await ipfs.pin.add(fixtures.files[0].cid, { recursive: false })
      expect(pinset.map(p => p.cid.toString())).to.include(fixtures.files[0].cid)
    })
  })
}

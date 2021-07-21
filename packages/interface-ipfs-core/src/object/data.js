/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const uint8ArrayFromString = require('uint8arrays/from-string')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.data', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get data by CID', async () => {
      const testObj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      const data = await ipfs.object.data(nodeCid)
      expect(testObj.Data).to.equalBytes(data)
    })

    it('returns error for request without argument', () => {
      return expect(ipfs.object.data(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      return expect(ipfs.object.data('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const CID = require('cids')
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

    it('should respect timeout option when getting the data from an object', () => {
      return testTimeout(() => ipfs.object.data(new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'), {
        timeout: 1
      }))
    })

    it('should get data by multihash', async () => {
      const testObj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      const data = await ipfs.object.data(nodeCid)
      expect(testObj.Data).to.deep.equal(data)
    })

    it('should get data by base58 encoded multihash string', async () => {
      const testObj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      const data = await ipfs.object.data(nodeCid.toV0().toString(), { enc: 'base58' })
      expect(testObj.Data).to.eql(data)
    })

    it('returns error for request without argument', () => {
      return expect(ipfs.object.data(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      return expect(ipfs.object.data('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}

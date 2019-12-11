/* eslint-env mocha */
'use strict'

const bs58 = require('bs58')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

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

    it('should get data by multihash', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      let data = await ipfs.object.data(nodeCid)
      // because js-ipfs-api can't infer
      // if the returned Data is Buffer or String
      if (typeof data === 'string') {
        data = Buffer.from(data)
      }
      expect(testObj.Data).to.deep.equal(data)
    })

    it('should get data by base58 encoded multihash', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      let data = await ipfs.object.data(bs58.encode(nodeCid.buffer), { enc: 'base58' })
      // because js-ipfs-api can't infer
      // if the returned Data is Buffer or String
      if (typeof data === 'string') {
        data = Buffer.from(data)
      }
      expect(testObj.Data).to.deep.equal(data)
    })

    it('should get data by base58 encoded multihash string', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      let data = await ipfs.object.data(bs58.encode(nodeCid.buffer).toString(), { enc: 'base58' })
      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof data === 'string') {
        data = Buffer.from(data)
      }
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

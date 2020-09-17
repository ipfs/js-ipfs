/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { getDescribe, getIt, expect } = require('../../utils/mocha')
const testTimeout = require('../../utils/test-timeout')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.setData', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when setting the data of an object', () => {
      return testTimeout(() => ipfs.object.patch.setData(new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'), uint8ArrayFromString('derp'), {
        timeout: 1
      }))
    })

    it('should set data for an existing node', async () => {
      const obj = {
        Data: uint8ArrayFromString('patch test object'),
        Links: []
      }
      const patchData = uint8ArrayFromString('set')

      const nodeCid = await ipfs.object.put(obj)
      const patchedNodeCid = await ipfs.object.patch.setData(nodeCid, patchData)
      const patchedNode = await ipfs.object.get(patchedNodeCid)

      expect(nodeCid).to.not.deep.equal(patchedNodeCid)
      expect(patchedNode.Data).to.eql(patchData)
    })

    it('returns error for request without key & data', () => {
      return expect(ipfs.object.patch.setData(null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request without data', () => {
      const filePath = 'test/fixtures/test-data/badnode.json'

      return expect(ipfs.object.patch.setData(null, filePath)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}

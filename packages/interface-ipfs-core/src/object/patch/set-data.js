/* eslint-env mocha */
'use strict'

const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const { getDescribe, getIt, expect } = require('../../utils/mocha')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.setData', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

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
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.setData(null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request without data', () => {
      const filePath = 'test/fixtures/test-data/badnode.json'

      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.setData(null, filePath)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}

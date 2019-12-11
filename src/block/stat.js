/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.stat', () => {
    const data = Buffer.from('blorb')
    let ipfs, hash

    before(async () => {
      ipfs = (await common.spawn()).api
      const block = await ipfs.block.put(data)
      hash = block.cid.multihash
    })

    after(() => common.clean())

    it('should stat by CID', async () => {
      const cid = new CID(hash)

      const stats = await ipfs.block.stat(cid)

      expect(stats).to.have.property('key')
      expect(stats).to.have.property('size')
    })

    it('should return error for missing argument', () => {
      return expect(ipfs.block.stat(null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return error for invalid argument', () => {
      return expect(ipfs.block.stat('invalid')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}

/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.stat', function () {
    this.timeout(60 * 1000)
    const data = Buffer.from('blorb')
    let ipfs, hash

    before(async () => {
      ipfs = await common.setup()
      const block = await ipfs.block.put(data)
      hash = block.cid.multihash
    })

    after(() => common.teardown())

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

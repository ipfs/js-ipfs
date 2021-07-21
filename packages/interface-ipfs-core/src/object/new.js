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

  describe('.object.new', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should create a new object with no template', async () => {
      const cid = await ipfs.object.new()
      expect(cid.toString()).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    })

    it('should create a new object with unixfs-dir template', async () => {
      const cid = await ipfs.object.new({ template: 'unixfs-dir' })
      expect(cid.toString()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })
  })
}

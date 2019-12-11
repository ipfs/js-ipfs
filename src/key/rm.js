/* eslint-env mocha */
'use strict'

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

  describe('.key.rm', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should rm a key', async function () {
      this.timeout(30 * 1000)

      const key = await ipfs.key.gen(hat(), { type: 'rsa', size: 2048 })

      const removeRes = await ipfs.key.rm(key.name)
      expect(removeRes).to.exist()
      expect(removeRes).to.have.property('name', key.name)
      expect(removeRes).to.have.property('id', key.id)

      const res = await ipfs.key.list()
      expect(res.find(k => k.name === key.name)).to.not.exist()
    })
  })
}

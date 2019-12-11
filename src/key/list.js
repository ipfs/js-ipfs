/* eslint-env mocha */
'use strict'

const pTimes = require('p-times')
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

  describe('.key.list', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should list all the keys', async function () {
      this.timeout(60 * 1000)

      const keys = await pTimes(3, () => ipfs.key.gen(hat(), { type: 'rsa', size: 2048 }), { concurrency: 1 })

      const res = await ipfs.key.list()
      expect(res).to.exist()
      expect(res).to.be.an('array')
      expect(res.length).to.be.above(keys.length - 1)

      keys.forEach(key => {
        const found = res.find(({ id, name }) => name === key.name && id === key.id)
        expect(found).to.exist()
      })
    })
  })
}

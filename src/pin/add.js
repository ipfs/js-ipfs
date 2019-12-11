/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.add', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api
      await Promise.all(fixtures.files.map(file => {
        return ipfs.add(file.data, { pin: false })
      }))
    })

    after(() => common.clean())

    it('should add a pin', async () => {
      const pinset = await ipfs.pin.add(fixtures.files[0].cid, { recursive: false })
      expect(pinset).to.deep.include({
        hash: fixtures.files[0].cid
      })
    })
  })
}

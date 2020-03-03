/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const drain = require('it-drain')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.rm', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api
      await drain(ipfs.add(fixtures.files[0].data, { pin: false }))
      await drain(ipfs.pin.add(fixtures.files[0].cid, { recursive: true }))
      await drain(ipfs.add(fixtures.files[1].data, { pin: false }))
      await drain(ipfs.pin.add(fixtures.files[1].cid, { recursive: false }))
    })

    after(() => common.clean())

    it('should remove a recursive pin', async () => {
      const removedPinset = await all(ipfs.pin.rm(fixtures.files[0].cid, { recursive: true }))
      expect(removedPinset.map(p => p.cid)).to.deep.equal([fixtures.files[0].cid])

      const pinset = await all(ipfs.pin.ls({ type: 'recursive' }))
      expect(pinset).to.not.deep.include({
        cid: fixtures.files[0].cid,
        type: 'recursive'
      })
    })

    it('should remove a direct pin', async () => {
      const removedPinset = await all(ipfs.pin.rm(fixtures.files[1].cid, { recursive: false }))
      expect(removedPinset.map(p => p.cid)).to.deep.equal([fixtures.files[1].cid])

      const pinset = await all(ipfs.pin.ls({ type: 'direct' }))
      expect(pinset.map(p => p.cid)).to.not.deep.include(fixtures.files[1].cid)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')

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
      await all(ipfs.add(fixtures.files[0].data, { pin: false }))
      await ipfs.pin.add(fixtures.files[0].cid, { recursive: true })
      await all(ipfs.add(fixtures.files[1].data, { pin: false }))
      await ipfs.pin.add(fixtures.files[1].cid, { recursive: false })
    })

    after(() => common.clean())

    it('should remove a recursive pin', async () => {
      const removedPinset = await ipfs.pin.rm(fixtures.files[0].cid, { recursive: true })
      expect(removedPinset.map(p => p.cid.toString())).to.deep.equal([fixtures.files[0].cid])

      const pinset = await all(ipfs.pin.ls({ type: 'recursive' }))
      expect(pinset.map(p => ({ ...p, cid: p.cid.toString() }))).to.not.deep.include({
        cid: fixtures.files[0].cid,
        type: 'recursive'
      })
    })

    it('should remove a direct pin', async () => {
      const removedPinset = await ipfs.pin.rm(fixtures.files[1].cid, { recursive: false })
      expect(removedPinset.map(p => p.cid.toString())).to.deep.equal([fixtures.files[1].cid])

      const pinset = await all(ipfs.pin.ls({ type: 'direct' }))
      expect(pinset.map(p => p.cid.toString())).to.not.include(fixtures.files[1].cid)
    })
  })
}

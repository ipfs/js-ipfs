/* eslint-env mocha */
'use strict'

const { fixtures, clearPins } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const drain = require('it-drain')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.rmAll', function () {
    this.timeout(50 * 1000)

    let ipfs
    beforeEach(async () => {
      ipfs = (await common.spawn()).api

      const dir = fixtures.directory.files.map((file) => ({ path: file.path, content: file.data }))
      await all(ipfs.addAll(dir, { pin: false, cidVersion: 0 }))

      await ipfs.add(fixtures.files[0].data, { pin: false })
      await ipfs.add(fixtures.files[1].data, { pin: false })
    })

    after(() => common.clean())

    beforeEach(() => {
      return clearPins(ipfs)
    })

    it('should respect timeout option when unpinning a block', async () => {
      await ipfs.pin.add(fixtures.files[0].cid, { recursive: true })

      await testTimeout(() => ipfs.pin.rmAll([fixtures.files[0].cid], {
        recursive: true,
        timeout: 1
      }))
    })

    it('should pipe the output of ls to rm', async () => {
      await ipfs.pin.add(fixtures.directory.cid)

      await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: 'recursive' })))

      await expect(all(ipfs.pin.ls())).to.eventually.have.lengthOf(0)
    })
  })
}

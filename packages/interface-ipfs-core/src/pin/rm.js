/* eslint-env mocha */
'use strict'

const { fixtures, expectPinned, clearPins } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const testTimeout = require('../utils/test-timeout')

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

      await testTimeout(() => ipfs.pin.rm(fixtures.files[0].cid, {
        recursive: true,
        timeout: 1
      }))
    })

    it('should remove a recursive pin', async () => {
      await ipfs.pin.add(fixtures.directory.cid)

      const unpinnedCid = await ipfs.pin.rm(fixtures.directory.cid, { recursive: true })
      expect(unpinnedCid).to.deep.equal(fixtures.directory.cid)

      const pinset = await all(ipfs.pin.ls({ type: 'recursive' }))
      expect(pinset).to.not.deep.include({
        cid: fixtures.directory.cid,
        type: 'recursive'
      })
    })

    it('should remove a direct pin', async () => {
      await ipfs.pin.add(fixtures.directory.cid, { recursive: false })

      const unpinnedCid = await ipfs.pin.rm(fixtures.directory.cid, { recursive: false })
      expect(unpinnedCid).to.deep.equal(fixtures.directory.cid)

      const pinset = await all(ipfs.pin.ls({ type: 'direct' }))
      expect(pinset.map(p => p.cid)).to.not.deep.include(fixtures.directory.cid)
    })

    it('should fail to remove an indirect pin', async () => {
      await ipfs.pin.add(fixtures.directory.cid)

      await expect(ipfs.pin.rm(fixtures.directory.files[0].cid))
        .to.eventually.be.rejected()
        .with(/is pinned indirectly under/)
      await expectPinned(ipfs, fixtures.directory.files[0].cid)
    })

    it('should fail when an item is not pinned', async () => {
      await expect(ipfs.pin.rm(fixtures.directory.cid))
        .to.eventually.be.rejected()
        .with(/is not pinned/)
    })
  })
}

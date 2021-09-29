/* eslint-env mocha */

import { fixtures, expectPinned, clearPins } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testRm (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.rm', function () {
    this.timeout(50 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    beforeEach(async () => {
      ipfs = (await factory.spawn()).api
      const dir = fixtures.directory.files.map((file) => ({ path: file.path, content: file.data }))
      await all(ipfs.addAll(dir, { pin: false, cidVersion: 0 }))

      await ipfs.add(fixtures.files[0].data, { pin: false })
      await ipfs.add(fixtures.files[1].data, { pin: false })
    })

    after(() => factory.clean())

    beforeEach(() => {
      return clearPins(ipfs)
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
      await ipfs.pin.add(fixtures.directory.cid, {
        recursive: true
      })

      await expect(ipfs.pin.rm(fixtures.directory.files[0].cid))
        .to.eventually.be.rejectedWith(/pinned indirectly/)
      await expectPinned(ipfs, fixtures.directory.files[0].cid)
    })

    it('should fail when an item is not pinned', async () => {
      await expect(ipfs.pin.rm(fixtures.directory.cid))
        .to.eventually.be.rejectedWith(/not pinned/)
    })
  })
}

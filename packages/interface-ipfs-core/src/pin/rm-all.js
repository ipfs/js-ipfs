/* eslint-env mocha */

import { fixtures, clearPins } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import drain from 'it-drain'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testRmAll (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.rmAll', function () {
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

    it('should pipe the output of ls to rm', async () => {
      await ipfs.pin.add(fixtures.directory.cid)

      await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: 'recursive' })))

      await expect(all(ipfs.pin.ls())).to.eventually.have.lengthOf(0)
    })
  })
}

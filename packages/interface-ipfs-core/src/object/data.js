/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testData (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.data', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get data by CID', async () => {
      const testObj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      const data = await ipfs.object.data(nodeCid)
      expect(testObj.Data).to.equalBytes(data)
    })

    it('returns error for request without argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.data(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.data('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}

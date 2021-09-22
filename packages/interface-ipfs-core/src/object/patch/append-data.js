/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testAppendData (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.appendData', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should append data to an existing node', async () => {
      const obj = {
        Data: uint8ArrayFromString('patch test object'),
        Links: []
      }

      const nodeCid = await ipfs.object.put(obj)
      const patchedNodeCid = await ipfs.object.patch.appendData(nodeCid, uint8ArrayFromString('append'))
      expect(patchedNodeCid).to.not.deep.equal(nodeCid)
    })

    it('returns error for request without key & data', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.appendData(null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request without data', () => {
      const filePath = 'test/fixtures/test-data/badnode.json'

      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.appendData(null, filePath)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}

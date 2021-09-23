/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { CID } from 'multiformats/cid'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testStat (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.stat', () => {
    const data = uint8ArrayFromString('blorb')
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    /** @type {CID} */
    let cid

    before(async () => {
      ipfs = (await factory.spawn()).api
      cid = await ipfs.block.put(data)
    })

    after(() => factory.clean())

    it('should respect timeout option when statting a block', () => {
      return testTimeout(() => ipfs.block.stat(CID.parse('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn'), {
        timeout: 1
      }))
    })

    it('should stat by CID', async () => {
      const stats = await ipfs.block.stat(cid)
      expect(stats.cid.toString()).to.equal(cid.toString())
      expect(stats).to.have.property('size', data.length)
    })

    it('should return error for missing argument', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.block.stat(null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return error for invalid argument', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.block.stat('invalid')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}

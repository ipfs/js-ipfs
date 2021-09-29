/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testNew (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.new', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should create a new object with no template', async () => {
      const cid = await ipfs.object.new()
      expect(cid.toString()).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    })

    it('should create a new object with unixfs-dir template', async () => {
      const cid = await ipfs.object.new({ template: 'unixfs-dir' })
      expect(cid.toString()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })
  })
}

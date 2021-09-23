/* eslint-env mocha */

import all from 'it-all'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testSubs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.subs', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get an empty array as a result of subscriptions before any resolve', async function () {
      // @ts-ignore this is mocha
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.exist()
      expect(res).to.eql([])
    })

    it('should get the list of subscriptions updated after a resolve', async function () {
      // @ts-ignore this is mocha
      this.timeout(300 * 1000)
      const id = 'QmNP1ASen5ZREtiJTtVD3jhMKhoPb1zppET1tgpjHx2NGA'

      const subs = await ipfs.name.pubsub.subs()
      expect(subs).to.eql([]) // initally empty

      await expect(all(ipfs.name.resolve(id))).to.eventually.be.rejected()

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.be.an('array').that.does.include(`/ipns/${id}`)
    })
  })
}

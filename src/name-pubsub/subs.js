/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.subs', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get an empty array as a result of subscriptions before any resolve', async function () {
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.exist()
      expect(res).to.eql([])
    })

    it('should get the list of subscriptions updated after a resolve', async function () {
      this.timeout(300 * 1000)
      const id = 'QmNP1ASen5ZREtiJTtVD3jhMKhoPb1zppET1tgpjHx2NGA'

      const subs = await ipfs.name.pubsub.subs()
      expect(subs).to.eql([]) // initally empty

      await expect(ipfs.name.resolve(id)).to.be.rejected()

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.be.an('array').that.does.include(`/ipns/${id}`)
    })
  })
}

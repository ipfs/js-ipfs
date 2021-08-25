/* eslint-env mocha */
'use strict'

const PeerId = require('peer-id')
const all = require('it-all')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.cancel', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    /** @type {string} */
    let nodeId

    before(async () => {
      ipfs = (await factory.spawn()).api
      const peerInfo = await ipfs.id()
      nodeId = peerInfo.id
    })

    after(() => factory.clean())

    it('should return false when the name that is intended to cancel is not subscribed', async function () {
      // @ts-ignore this is mocha
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.cancel(nodeId)
      expect(res).to.exist()
      expect(res).to.have.property('canceled')
      expect(res.canceled).to.be.false()
    })

    it('should cancel a subscription correctly returning true', async function () {
      // @ts-ignore this is mocha
      this.timeout(300 * 1000)

      const peerId = await PeerId.create({ bits: 512 })
      const id = peerId.toB58String()
      const ipnsPath = `/ipns/${id}`

      const subs = await ipfs.name.pubsub.subs()
      expect(subs).to.be.an('array').that.does.not.include(ipnsPath)

      await expect(all(ipfs.name.resolve(id))).to.eventually.be.rejected()

      const subs1 = await ipfs.name.pubsub.subs()
      const cancel = await ipfs.name.pubsub.cancel(ipnsPath)
      const subs2 = await ipfs.name.pubsub.subs()

      expect(subs1).to.be.an('array').that.includes(ipnsPath)
      expect(cancel).to.have.property('canceled')
      expect(cancel.canceled).to.be.true()
      expect(subs2).to.be.an('array').that.does.not.include(ipnsPath)
    })
  })
}

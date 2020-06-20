/* eslint-env mocha */
'use strict'

const all = require('it-all')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.cancel', () => {
    let ipfs
    let otherIpfs
    let nodeId
    let otherNodeId

    before(async () => {
      ipfs = (await common.spawn()).api
      nodeId = ipfs.peerId.id
      otherIpfs = (await common.spawn()).api
      otherNodeId = otherIpfs.peerId.id

      await ipfs.swarm.connect(otherIpfs.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should respect timeout option when cancelling an IPNS pubsub subscription', () => {
      return testTimeout(() => ipfs.name.pubsub.cancel(nodeId, {
        timeout: 1
      }))
    })

    it('should return false when the name that is intended to cancel is not subscribed', async function () {
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.cancel(nodeId)
      expect(res).to.exist()
      expect(res).to.have.property('canceled')
      expect(res.canceled).to.eql(false)
    })

    it('should cancel a subscription correctly returning true', async function () {
      this.timeout(300 * 1000)

      const ipnsPath = `/ipns/${otherNodeId}`

      const subs = await ipfs.name.pubsub.subs()
      expect(subs).to.be.an('array').that.does.not.include(ipnsPath)

      await expect(all(ipfs.name.resolve(otherNodeId))).to.eventually.be.rejected()

      const subs1 = await ipfs.name.pubsub.subs()
      const cancel = await ipfs.name.pubsub.cancel(ipnsPath)
      const subs2 = await ipfs.name.pubsub.subs()

      expect(subs1).to.be.an('array').that.does.include(ipnsPath)
      expect(cancel).to.have.property('canceled')
      expect(cancel.canceled).to.eql(true)
      expect(subs2).to.be.an('array').that.does.not.include(ipnsPath)
    })
  })
}

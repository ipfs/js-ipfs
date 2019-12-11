/* eslint-env mocha */
'use strict'

const pullToPromise = require('pull-to-promise')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isPong } = require('./utils.js')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pingPullStream', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = (await common.spawn()).api
      ipfsB = (await common.spawn({ type: 'js' })).api
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should send the specified number of packets over pull stream', async () => {
      const count = 3

      const results = await pullToPromise.any(ipfsA.pingPullStream(ipfsB.peerId.id, { count }))

      const packetNum = results.reduce((acc, result) => {
        expect(result.success).to.be.true()

        if (isPong(result)) {
          acc++
        }

        return acc
      }, 0)

      expect(packetNum).to.equal(count)
    })

    it('should fail when pinging an unknown peer over pull stream', () => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      return expect(pullToPromise.any(ipfsA.pingPullStream(unknownPeerId, { count })))
        .to.eventually.be.rejected()
    })

    it('should fail when pinging an invalid peer id over pull stream', () => {
      const invalidPeerId = 'not a peer ID'
      const count = 2

      return expect(pullToPromise.any(ipfsA.pingPullStream(invalidPeerId, { count })))
        .to.eventually.be.rejected()
    })
  })
}

/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsPingResponse, isPong } = require('./utils')
const all = require('it-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.ping', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = (await common.spawn()).api
      ipfsB = (await common.spawn()).api
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should send the specified number of packets', async () => {
      const count = 3
      const responses = await all(ipfsA.ping(ipfsB.peerId.id, { count }))
      responses.forEach(expectIsPingResponse)

      const pongs = responses.filter(isPong)
      expect(pongs.length).to.equal(count)
    })

    it('should fail when pinging a peer that is not available', () => {
      const notAvailablePeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      return expect(all(ipfsA.ping(notAvailablePeerId, { count }))).to.eventually.be.rejected()
    })

    it('should fail when pinging an invalid peer Id', () => {
      const invalidPeerId = 'not a peer ID'
      const count = 2

      return expect(all(ipfsA.ping(invalidPeerId, { count }))).to.eventually.be.rejected()
    })
  })
}

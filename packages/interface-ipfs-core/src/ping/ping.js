/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsPingResponse, isPong } = require('./utils')
const all = require('it-all')
const drain = require('it-drain')
const { isWebWorker } = require('ipfs-utils/src/env')
const testTimeout = require('../utils/test-timeout')
const getIpfsOptions = require('../utils/ipfs-options-websockets-filter-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const ipfsOptions = getIpfsOptions()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.ping', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = (await common.spawn({ type: 'proc', ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should respect timeout option when pinging a peer', () => {
      return testTimeout(() => drain(ipfsA.ping(ipfsB.peerId.id, {
        timeout: 1
      })))
    })

    it('should send the specified number of packets', async () => {
      const count = 3
      const responses = await all(ipfsA.ping(ipfsB.peerId.id, { count }))
      responses.forEach(expectIsPingResponse)

      const pongs = responses.filter(isPong)
      expect(pongs.length).to.equal(count)
    })

    it('should fail when pinging a peer that is not available', async () => {
      const notAvailablePeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      try {
        await all(ipfsA.ping(notAvailablePeerId, { count }))
        throw new Error('Should throw')
      } catch (error) {
        expect(error.message).to.not.eq('Should throw')
      }
    })

    it('should fail when pinging an invalid peer Id', () => {
      const invalidPeerId = 'not a peer ID'
      const count = 2

      return expect(all(ipfsA.ping(invalidPeerId, { count }))).to.eventually.be.rejected()
    })

    it('can ping without options', async () => {
      const res = await all(ipfsA.ping(ipfsB.peerId.id))
      expect(res.length).to.be.ok()
      expect(res[0].success).to.be.true()
    })
  })
}

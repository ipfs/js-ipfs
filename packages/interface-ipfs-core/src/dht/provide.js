/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const CID = require('cids')
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

  describe('.dht.provide', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
      const nodeB = (await common.spawn()).api
      await ipfs.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should respect timeout option when providing a value on the DHT', async () => {
      const res = await ipfs.add(uint8ArrayFromString('test'))

      await testTimeout(() => ipfs.dht.provide(res.cid, {
        timeout: 1
      }))
    })

    it('should provide local CID', async () => {
      const res = await ipfs.add(uint8ArrayFromString('test'))

      await all(ipfs.dht.provide(res.cid))
    })

    it('should not provide if block not found locally', () => {
      const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      return expect(all(ipfs.dht.provide(cid))).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('not found locally')
    })

    it('should allow multiple CIDs to be passed', async () => {
      const res = await all(ipfs.addAll([
        { content: uint8ArrayFromString('t0') },
        { content: uint8ArrayFromString('t1') }
      ]))

      await all(ipfs.dht.provide(res.map(f => f.cid)))
    })

    it('should provide a CIDv1', async () => {
      const res = await ipfs.add(uint8ArrayFromString('test'), { cidVersion: 1 })
      await all(ipfs.dht.provide(res.cid))
    })

    it('should error on non CID arg', () => {
      return expect(all(ipfs.dht.provide({}))).to.eventually.be.rejected()
    })

    it('should error on array containing non CID arg', () => {
      return expect(all(ipfs.dht.provide([{}]))).to.eventually.be.rejected()
    })
  })
}

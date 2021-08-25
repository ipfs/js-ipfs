/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { CID } = require('multiformats/cid')
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

  describe('.dht.provide', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
      const nodeB = (await factory.spawn()).api
      const nodeBId = await nodeB.id()
      await ipfs.swarm.connect(nodeBId.addresses[0])
    })

    after(() => factory.clean())

    it('should provide local CID', async () => {
      const res = await ipfs.add(uint8ArrayFromString('test'))

      await all(ipfs.dht.provide(res.cid))
    })

    it('should not provide if block not found locally', () => {
      const cid = CID.parse('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

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
      // @ts-expect-error invalid arg
      return expect(all(ipfs.dht.provide({}))).to.eventually.be.rejected()
    })

    it('should error on array containing non CID arg', () => {
      // @ts-expect-error invalid arg
      return expect(all(ipfs.dht.provide([{}]))).to.eventually.be.rejected()
    })
  })
}

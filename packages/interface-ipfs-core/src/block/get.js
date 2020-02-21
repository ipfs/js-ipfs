/* eslint-env mocha */
'use strict'

const multihash = require('multihashes')
const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.get', () => {
    const data = Buffer.from('blorb')
    let ipfs, hash

    before(async () => {
      ipfs = (await common.spawn()).api
      const block = await ipfs.block.put(data)
      hash = block.cid.multihash
    })

    after(() => common.clean())

    it('should get by CID object', async () => {
      const cid = new CID(hash)
      const block = await ipfs.block.get(cid)

      expect(block.data).to.eql(Buffer.from('blorb'))
      expect(block.cid.multihash).to.eql(cid.multihash)
    })

    it('should get by CID in string', async () => {
      const block = await ipfs.block.get(multihash.toB58String(hash))

      expect(block.data).to.eql(Buffer.from('blorb'))
      expect(block.cid.multihash).to.eql(hash)
    })

    it('should get an empty block', async () => {
      const res = await ipfs.block.put(Buffer.alloc(0), {
        format: 'dag-pb',
        mhtype: 'sha2-256',
        version: 0
      })

      const block = await ipfs.block.get(res.cid)

      expect(block.data).to.eql(Buffer.alloc(0))
    })

    it('should get a block added as CIDv0 with a CIDv1', async () => {
      const input = Buffer.from(`TEST${Date.now()}`)

      const res = await ipfs.block.put(input, { version: 0 })

      const cidv0 = res.cid
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const block = await ipfs.block.get(cidv1)
      expect(block.data).to.eql(input)
    })

    it('should get a block added as CIDv1 with a CIDv0', async () => {
      const input = Buffer.from(`TEST${Date.now()}`)

      const res = await ipfs.block.put(input, { version: 1 })

      const cidv1 = res.cid
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const block = await ipfs.block.get(cidv0)
      expect(block.data).to.eql(input)
    })

    it('should return an error for an invalid CID', () => {
      return expect(ipfs.block.get('invalid')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('Non-base58 character')
    })
  })
}

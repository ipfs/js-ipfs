/* eslint-env mocha */
'use strict'

const Block = require('ipfs-block')
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

  describe('.block.put', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should put a buffer, using defaults', async () => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const blob = Buffer.from('blorb')

      const block = await ipfs.block.put(blob)

      expect(block.data).to.be.eql(blob)
      expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
    })

    it('should put a buffer, using CID', async () => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(expectedHash)
      const blob = Buffer.from('blorb')

      const block = await ipfs.block.put(blob, { cid: cid })

      expect(block.data).to.be.eql(blob)
      expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
    })

    it('should put a buffer, using options', async () => {
      const blob = Buffer.from(`TEST${Date.now()}`)

      const block = await ipfs.block.put(blob, {
        format: 'raw',
        mhtype: 'sha2-512',
        version: 1
      })

      expect(block.data).to.be.eql(blob)
      expect(block.cid.version).to.equal(1)
      expect(block.cid.codec).to.equal('raw')
      expect(multihash.decode(block.cid.multihash).name).to.equal('sha2-512')
    })

    it('should put a Block instance', async () => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(expectedHash)
      const b = new Block(Buffer.from('blorb'), cid)

      const block = await ipfs.block.put(b)

      expect(block.data).to.eql(Buffer.from('blorb'))
      expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
    })

    it('should error with array of blocks', () => {
      const blob = Buffer.from('blorb')

      return expect(ipfs.block.put([blob, blob])).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}

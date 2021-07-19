/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { identity } = require('multiformats/hashes/identity')
const { CID } = require('multiformats/cid')
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

  describe('.block.get', () => {
    const data = uint8ArrayFromString('blorb')
    let ipfs, cid

    before(async () => {
      ipfs = (await common.spawn()).api
      cid = await ipfs.block.put(data)
    })

    after(() => common.clean())

    it('should respect timeout option when getting a block', () => {
      return testTimeout(() => ipfs.block.get(CID.parse('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rA3'), {
        timeout: 1
      }))
    })

    it('should get by CID', async () => {
      const block = await ipfs.block.get(cid)

      expect(block).to.equalBytes(uint8ArrayFromString('blorb'))
    })

    it('should get an empty block', async () => {
      const cid = await ipfs.block.put(new Uint8Array(0), {
        format: 'dag-pb',
        mhtype: 'sha2-256',
        version: 0
      })

      const block = await ipfs.block.get(cid)
      expect(block).to.equalBytes(new Uint8Array(0))
    })

    it('should get a block added as CIDv0 with a CIDv1', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const cidv0 = await ipfs.block.put(input)
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const block = await ipfs.block.get(cidv1)
      expect(block).to.equalBytes(input)
    })

    it('should get a block added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const cidv1 = await ipfs.block.put(input, {
        version: 1,
        format: 'dag-pb'
      })
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const block = await ipfs.block.get(cidv0)
      expect(block).to.equalBytes(input)
    })

    it('should get a block with an identity CID, without putting first', async () => {
      const identityData = uint8ArrayFromString('A16461736466190144', 'base16upper')
      const identityHash = await identity.digest(identityData)
      const identityCID = CID.createV1(identity.code, identityHash)
      const block = await ipfs.block.get(identityCID)
      expect(block).to.equalBytes(identityData)
    })

    it('should return an error for an invalid CID', () => {
      return expect(ipfs.block.get('Non-base58 character')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}

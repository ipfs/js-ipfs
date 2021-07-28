/* eslint-env mocha */
'use strict'

const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { nanoid } = require('nanoid')
const all = require('it-all')
const last = require('it-last')
const drain = require('it-drain')
const { CID } = require('multiformats/cid')
const raw = require('multiformats/codecs/raw')
const testTimeout = require('../utils/test-timeout')

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

  describe('.block.rm', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should respect timeout option when removing a block', () => {
      return testTimeout(() => drain(ipfs.block.rm(CID.parse('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn'), {
        timeout: 1
      })))
    })

    it('should remove by CID object', async () => {
      const cid = await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })

      // block should be present in the local store
      const localRefs = await all(ipfs.refs.local())
      expect(localRefs).to.have.property('length').that.is.greaterThan(0)
      expect(localRefs.find(ref => ref.ref === CID.createV1(raw.code, cid.multihash).toString())).to.be.ok()

      const result = await all(ipfs.block.rm(cid))
      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0].cid.toString()).equal(cid.toString())
      expect(result[0]).to.not.have.property('error')

      // did we actually remove the block?
      const localRefsAfterRemove = await all(ipfs.refs.local())
      expect(localRefsAfterRemove.find(ref => ref.ref === CID.createV1(raw.code, cid.multihash).toString())).to.not.be.ok()
    })

    it('should remove multiple CIDs', async () => {
      const cids = await Promise.all([
        ipfs.dag.put(uint8ArrayFromString(nanoid()), {
          format: 'raw',
          hashAlg: 'sha2-256'
        }),
        ipfs.dag.put(uint8ArrayFromString(nanoid()), {
          format: 'raw',
          hashAlg: 'sha2-256'
        }),
        ipfs.dag.put(uint8ArrayFromString(nanoid()), {
          format: 'raw',
          hashAlg: 'sha2-256'
        })
      ])

      const result = await all(ipfs.block.rm(cids))

      expect(result).to.have.lengthOf(3)

      result.forEach((res, index) => {
        expect(res.cid.toString()).to.equal(cids[index].toString())
        expect(res).to.not.have.property('error')
      })
    })

    it('should error when removing non-existent blocks', async () => {
      const cid = await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })

      // remove it
      await all(ipfs.block.rm(cid))

      // remove it again
      const result = await all(ipfs.block.rm(cid))

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result).to.have.nested.property('[0].error.message').that.includes('block not found')
    })

    it('should not error when force removing non-existent blocks', async () => {
      const cid = await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })

      // remove it
      await all(ipfs.block.rm(cid))

      // remove it again
      const result = await all(ipfs.block.rm(cid, { force: true }))

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0].cid.toString()).to.equal(cid.toString())
      expect(result[0]).to.not.have.property('error')
    })

    it('should return empty output when removing blocks quietly', async () => {
      const cid = await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })
      const result = await all(ipfs.block.rm(cid, { quiet: true }))

      expect(result).to.be.an('array').and.to.have.lengthOf(0)
    })

    it('should error when removing pinned blocks', async () => {
      const cid = await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })
      await ipfs.pin.add(cid)

      const result = await last(ipfs.block.rm(cid))

      expect(result).to.have.property('error').that.is.an('Error')
        .with.property('message').that.includes('pinned')
    })

    it('should throw error for invalid CID input', () => {
      // @ts-expect-error invalid input
      return expect(all(ipfs.block.rm('INVALID CID')))
        .to.eventually.be.rejected()
    })
  })
}

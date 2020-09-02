/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { nanoid } = require('nanoid')
const all = require('it-all')
const last = require('it-last')
const drain = require('it-drain')
const CID = require('cids')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.rm', () => {
    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should respect timeout option when removing a block', () => {
      return testTimeout(() => drain(ipfs.block.rm(new CID('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn'), {
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
      expect(localRefs.find(ref => ref.ref === new CID(1, 'raw', cid.multihash).toString())).to.be.ok()

      const result = await all(ipfs.block.rm(cid))
      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0].cid.toString()).equal(cid.toString())
      expect(result[0]).to.not.have.property('error')

      // did we actually remove the block?
      const localRefsAfterRemove = await all(ipfs.refs.local())
      expect(localRefsAfterRemove.find(ref => ref.ref === new CID(1, 'raw', cid.multihash).toString())).to.not.be.ok()
    })

    it('should remove by CID in string', async () => {
      const cid = await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })
      const result = await all(ipfs.block.rm(cid.toString()))

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0].cid.toString()).to.equal(cid.toString())
      expect(result[0]).to.not.have.property('error')
    })

    it('should remove by CID in buffer', async () => {
      const cid = await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })
      const result = await all(ipfs.block.rm(cid.bytes))

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0].cid.toString()).to.equal(cid.toString())
      expect(result[0]).to.not.have.property('error')
    })

    it('should remove multiple CIDs', async () => {
      const cids = [
        await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
          format: 'raw',
          hashAlg: 'sha2-256'
        }),
        await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
          format: 'raw',
          hashAlg: 'sha2-256'
        }),
        await ipfs.dag.put(uint8ArrayFromString(nanoid()), {
          format: 'raw',
          hashAlg: 'sha2-256'
        })
      ]

      const result = await all(ipfs.block.rm(cids))

      expect(result).to.be.an('array').and.to.have.lengthOf(3)

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
      expect(result[0]).to.have.property('error')
      expect(result[0].error.message).to.include('block not found')
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
  })
}

/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { DAGNode } = require('ipld-dag-pb')
const all = require('it-all')
const drain = require('it-drain')
const testTimeout = require('../utils/test-timeout')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.repo.gc', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when garbage collecting', () => {
      return testTimeout(() => ipfs.repo.gc({
        timeout: 1
      }))
    })

    it('should run garbage collection', async () => {
      const res = await ipfs.add(uint8ArrayFromString('apples'))

      const pinset = await all(ipfs.pin.ls())
      expect(pinset.map(obj => obj.cid.toString())).includes(res.cid.toString())

      await ipfs.pin.rm(res.cid)
      await all(ipfs.repo.gc())

      const finalPinset = await all(ipfs.pin.ls())
      expect(finalPinset.map(obj => obj.cid.toString())).not.includes(res.cid.toString())
    })

    it('should clean up unpinned data', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add some data. Note: this will implicitly pin the data, which causes
      // some blocks to be added for the data itself and for the pinning
      // information that refers to the blocks
      const addRes = await ipfs.add(uint8ArrayFromString('apples'))
      const cid = addRes.cid

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => new CID(r.ref).multihash)).deep.includes(cid.multihash)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      const refsAfterGc = await all(ipfs.refs.local())
      expect(refsAfterGc.map(r => new CID(r.ref).multihash)).deep.includes(cid.multihash)

      // Unpin the data
      await ipfs.pin.rm(cid)

      // Run garbage collection
      await all(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hash
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      expect(refsAfterUnpinAndGc.map(r => new CID(r.ref).multihash)).not.deep.includes(cid.multihash)
    })

    it('should clean up removed MFS files', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add a file to MFS
      await ipfs.files.write('/test', uint8ArrayFromString('oranges'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => new CID(r.ref).multihash)).deep.includes(stats.cid.multihash)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is in MFS
      const refsAfterGc = await all(ipfs.refs.local())
      expect(refsAfterGc.map(r => new CID(r.ref).multihash)).deep.includes(stats.cid.multihash)

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hash
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      expect(refsAfterUnpinAndGc.map(r => new CID(r.ref).multihash)).not.deep.includes(stats.cid.multihash)
    })

    it('should clean up block only after unpinned and removed from MFS', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add a file to MFS
      await ipfs.files.write('/test', uint8ArrayFromString('peaches'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')
      const mfsFileCid = stats.cid

      // Get the CID of the data in the file
      const block = await ipfs.block.get(mfsFileCid)

      // Add the data to IPFS (which implicitly pins the data)
      const addRes = await ipfs.add(block.data)
      const dataCid = addRes.cid

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain the data hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => new CID(r.ref).multihash)).deep.includes(dataCid.multihash)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is pinned and in MFS
      const refsAfterGc = await all(ipfs.refs.local())
      expect(refsAfterGc.map(r => new CID(r.ref).multihash)).deep.includes(dataCid.multihash)

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      const refsAfterRmAndGc = await all(ipfs.refs.local())
      expect(refsAfterRmAndGc.map(r => new CID(r.ref).multihash)).not.deep.includes(mfsFileCid.multihash)
      expect(refsAfterRmAndGc.map(r => new CID(r.ref).multihash)).deep.includes(dataCid.multihash)

      // Unpin the data
      await ipfs.pin.rm(dataCid)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hashes
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      expect(refsAfterUnpinAndGc.map(r => new CID(r.ref).multihash)).not.deep.includes(mfsFileCid.multihash)
      expect(refsAfterUnpinAndGc.map(r => new CID(r.ref).multihash)).not.deep.includes(dataCid.multihash)
    })

    it('should clean up indirectly pinned data after recursive pin removal', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add some data
      const addRes = await ipfs.add(uint8ArrayFromString('pears'))
      const dataCid = addRes.cid

      // Unpin the data
      await ipfs.pin.rm(dataCid)

      // Create a link to the data from an object
      const obj = await new DAGNode(uint8ArrayFromString('fruit'), [{
        Name: 'p',
        Hash: dataCid,
        Tsize: addRes.size
      }])

      // Put the object into IPFS
      const objCid = await ipfs.object.put(obj)

      // Putting an object doesn't pin it
      expect((await all(ipfs.pin.ls())).map(p => p.cid.toString())).not.includes(objCid.toString())

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain data and object hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => new CID(r.ref).multihash)).deep.includes(objCid.multihash)
      expect(refsAfterAdd.map(r => new CID(r.ref).multihash)).deep.includes(dataCid.multihash)

      // Recursively pin the object
      await ipfs.pin.add(objCid, { recursive: true })

      // The data should now be indirectly pinned
      const pins = await all(ipfs.pin.ls())
      expect(pins.find(p => p.cid.toString() === dataCid.toString()).type).to.eql('indirect')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the data
      // hash, because the data is still (indirectly) pinned
      const refsAfterGc = await all(ipfs.refs.local())
      expect(refsAfterGc.map(r => new CID(r.ref).multihash)).deep.includes(dataCid.multihash)

      // Recursively unpin the object
      await ipfs.pin.rm(objCid.toString())

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hashes
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      expect(refsAfterUnpinAndGc.map(r => new CID(r.ref).multihash)).not.deep.includes(objCid.multihash)
      expect(refsAfterUnpinAndGc.map(r => new CID(r.ref).multihash)).not.deep.includes(dataCid.multihash)
    })
  })
}

/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { DAGNode } = require('ipld-dag-pb')
const all = require('it-all')
const drain = require('it-drain')

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

    it('should run garbage collection', async () => {
      const res = await all(ipfs.add(Buffer.from('apples')))

      const pinset = await all(ipfs.pin.ls())
      expect(pinset.map(obj => obj.cid.toString())).includes(res[0].cid.toString())

      await drain(ipfs.pin.rm(res[0].cid))
      await drain(ipfs.repo.gc())

      const finalPinset = await all(ipfs.pin.ls())
      expect(finalPinset.map(obj => obj.cid.toString())).not.includes(res[0].cid.toString())
    })

    it('should clean up unpinned data', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add some data. Note: this will implicitly pin the data, which causes
      // some blocks to be added for the data itself and for the pinning
      // information that refers to the blocks
      const addRes = await all(ipfs.add(Buffer.from('apples')))
      const cid = addRes[0].cid

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => r.ref)).includes(cid.toString())

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      const refsAfterGc = await all(ipfs.refs.local())
      expect(refsAfterGc.map(r => r.ref)).includes(cid.toString())

      // Unpin the data
      await drain(ipfs.pin.rm(cid))

      // Run garbage collection
      await all(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hash
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      expect(refsAfterUnpinAndGc.map(r => r.ref)).not.includes(cid.toString())
    })

    it('should clean up removed MFS files', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add a file to MFS
      await ipfs.files.write('/test', Buffer.from('oranges'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')
      const hash = stats.cid.toString()

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => r.ref)).includes(hash)

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is in MFS
      const refsAfterGc = await all(ipfs.refs.local())
      expect(refsAfterGc.map(r => r.ref)).includes(hash)

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hash
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      expect(refsAfterUnpinAndGc.map(r => r.ref)).not.includes(hash)
    })

    it('should clean up block only after unpinned and removed from MFS', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add a file to MFS
      await ipfs.files.write('/test', Buffer.from('peaches'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')
      const mfsFileCid = stats.cid

      // Get the CID of the data in the file
      const block = await ipfs.block.get(mfsFileCid)

      // Add the data to IPFS (which implicitly pins the data)
      const addRes = await all(ipfs.add(block.data))
      const dataCid = addRes[0].cid

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain the data hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      const hashesAfterAdd = refsAfterAdd.map(r => r.ref)
      expect(hashesAfterAdd).includes(dataCid.toString())

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is pinned and in MFS
      const refsAfterGc = await all(ipfs.refs.local())
      const hashesAfterGc = refsAfterGc.map(r => r.ref)
      expect(hashesAfterGc).includes(dataCid.toString())

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      const refsAfterRmAndGc = await all(ipfs.refs.local())
      const hashesAfterRmAndGc = refsAfterRmAndGc.map(r => r.ref)
      expect(hashesAfterRmAndGc).not.includes(mfsFileCid.toString())
      expect(hashesAfterRmAndGc).includes(dataCid.toString())

      // Unpin the data
      await drain(ipfs.pin.rm(dataCid))

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hashes
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      const hashesAfterUnpinAndGc = refsAfterUnpinAndGc.map(r => r.ref)
      expect(hashesAfterUnpinAndGc).not.includes(mfsFileCid.toString())
      expect(hashesAfterUnpinAndGc).not.includes(dataCid.toString())
    })

    it('should clean up indirectly pinned data after recursive pin removal', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await all(ipfs.refs.local())

      // Add some data
      const addRes = await all(ipfs.add(Buffer.from('pears')))
      const dataCid = addRes[0].cid

      // Unpin the data
      await drain(ipfs.pin.rm(dataCid))

      // Create a link to the data from an object
      const obj = await new DAGNode(Buffer.from('fruit'), [{
        Name: 'p',
        Hash: dataCid,
        TSize: addRes[0].size
      }])

      // Put the object into IPFS
      const objCid = await ipfs.object.put(obj)

      // Putting an object doesn't pin it
      expect((await all(ipfs.pin.ls())).map(p => p.cid.toString())).not.includes(objCid.toString())

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain data and object hash
      const refsAfterAdd = await all(ipfs.refs.local())
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      const hashesAfterAdd = refsAfterAdd.map(r => r.ref)
      expect(hashesAfterAdd).includes(objCid.toString())
      expect(hashesAfterAdd).includes(dataCid.toString())

      // Recursively pin the object
      await drain(ipfs.pin.add(objCid, { recursive: true }))

      // The data should now be indirectly pinned
      const pins = await all(ipfs.pin.ls())
      expect(pins.find(p => p.cid.toString() === dataCid.toString()).type).to.eql('indirect')

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // Get the list of local blocks after GC, should still contain the data
      // hash, because the data is still (indirectly) pinned
      const refsAfterGc = await all(ipfs.refs.local())
      expect(refsAfterGc.map(r => r.ref)).includes(dataCid.toString())

      // Recursively unpin the object
      await drain(ipfs.pin.rm(objCid.toString()))

      // Run garbage collection
      await drain(ipfs.repo.gc())

      // The list of local blocks should no longer contain the hashes
      const refsAfterUnpinAndGc = await all(ipfs.refs.local())
      const hashesAfterUnpinAndGc = refsAfterUnpinAndGc.map(r => r.ref)
      expect(hashesAfterUnpinAndGc).not.includes(objCid.toString())
      expect(hashesAfterUnpinAndGc).not.includes(dataCid.toString())
    })
  })
}

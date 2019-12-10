/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { DAGNode } = require('ipld-dag-pb')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.repo.gc', () => {
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should run garbage collection', async () => {
      const res = await ipfs.add(Buffer.from('apples'))

      const pinset = await ipfs.pin.ls()
      expect(pinset.map((obj) => obj.hash)).includes(res[0].hash)

      await ipfs.pin.rm(res[0].hash)
      await ipfs.repo.gc()

      const finalPinset = await ipfs.pin.ls()
      expect(finalPinset.map((obj) => obj.hash)).not.includes(res[0].hash)
    })

    it('should clean up unpinned data', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await ipfs.refs.local()

      // Add some data. Note: this will implicitly pin the data, which causes
      // some blocks to be added for the data itself and for the pinning
      // information that refers to the blocks
      const addRes = await ipfs.add(Buffer.from('apples'))
      const hash = addRes[0].hash

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      const refsAfterAdd = await ipfs.refs.local()
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => r.ref)).includes(hash)

      // Run garbage collection
      await ipfs.repo.gc()

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      const refsAfterGc = await ipfs.refs.local()
      expect(refsAfterGc.map(r => r.ref)).includes(hash)

      // Unpin the data
      await ipfs.pin.rm(hash)

      // Run garbage collection
      await ipfs.repo.gc()

      // The list of local blocks should no longer contain the hash
      const refsAfterUnpinAndGc = await ipfs.refs.local()
      expect(refsAfterUnpinAndGc.map(r => r.ref)).not.includes(hash)
    })

    it('should clean up removed MFS files', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await ipfs.refs.local()

      // Add a file to MFS
      await ipfs.files.write('/test', Buffer.from('oranges'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')
      const hash = stats.hash

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain hash
      const refsAfterAdd = await ipfs.refs.local()
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      expect(refsAfterAdd.map(r => r.ref)).includes(hash)

      // Run garbage collection
      await ipfs.repo.gc()

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is in MFS
      const refsAfterGc = await ipfs.refs.local()
      expect(refsAfterGc.map(r => r.ref)).includes(hash)

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await ipfs.repo.gc()

      // The list of local blocks should no longer contain the hash
      const refsAfterUnpinAndGc = await ipfs.refs.local()
      expect(refsAfterUnpinAndGc.map(r => r.ref)).not.includes(hash)
    })

    it('should clean up block only after unpinned and removed from MFS', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await ipfs.refs.local()

      // Add a file to MFS
      await ipfs.files.write('/test', Buffer.from('peaches'), { create: true })
      const stats = await ipfs.files.stat('/test')
      expect(stats.type).to.equal('file')
      const mfsFileHash = stats.hash

      // Get the CID of the data in the file
      const block = await ipfs.block.get(mfsFileHash)

      // Add the data to IPFS (which implicitly pins the data)
      const addRes = await ipfs.add(block.data)
      const dataHash = addRes[0].hash

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain the data hash
      const refsAfterAdd = await ipfs.refs.local()
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      const hashesAfterAdd = refsAfterAdd.map(r => r.ref)
      expect(hashesAfterAdd).includes(dataHash)

      // Run garbage collection
      await ipfs.repo.gc()

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is pinned and in MFS
      const refsAfterGc = await ipfs.refs.local()
      const hashesAfterGc = refsAfterGc.map(r => r.ref)
      expect(hashesAfterGc).includes(dataHash)

      // Remove the file
      await ipfs.files.rm('/test')

      // Run garbage collection
      await ipfs.repo.gc()

      // Get the list of local blocks after GC, should still contain the hash,
      // because the file is still pinned
      const refsAfterRmAndGc = await ipfs.refs.local()
      const hashesAfterRmAndGc = refsAfterRmAndGc.map(r => r.ref)
      expect(hashesAfterRmAndGc).not.includes(mfsFileHash)
      expect(hashesAfterRmAndGc).includes(dataHash)

      // Unpin the data
      await ipfs.pin.rm(dataHash)

      // Run garbage collection
      await ipfs.repo.gc()

      // The list of local blocks should no longer contain the hashes
      const refsAfterUnpinAndGc = await ipfs.refs.local()
      const hashesAfterUnpinAndGc = refsAfterUnpinAndGc.map(r => r.ref)
      expect(hashesAfterUnpinAndGc).not.includes(mfsFileHash)
      expect(hashesAfterUnpinAndGc).not.includes(dataHash)
    })

    it('should clean up indirectly pinned data after recursive pin removal', async () => {
      // Get initial list of local blocks
      const refsBeforeAdd = await ipfs.refs.local()

      // Add some data
      const addRes = await ipfs.add(Buffer.from('pears'))
      const dataHash = addRes[0].hash

      // Unpin the data
      await ipfs.pin.rm(dataHash)

      // Create a link to the data from an object
      const obj = await new DAGNode(Buffer.from('fruit'), [{
        Name: 'p',
        Hash: dataHash,
        TSize: addRes[0].size
      }])

      // Put the object into IPFS
      const objHash = (await ipfs.object.put(obj)).toString()

      // Putting an object doesn't pin it
      expect((await ipfs.pin.ls()).map(p => p.hash)).not.includes(objHash)

      // Get the list of local blocks after the add, should be bigger than
      // the initial list and contain data and object hash
      const refsAfterAdd = await ipfs.refs.local()
      expect(refsAfterAdd.length).to.be.gt(refsBeforeAdd.length)
      const hashesAfterAdd = refsAfterAdd.map(r => r.ref)
      expect(hashesAfterAdd).includes(objHash)
      expect(hashesAfterAdd).includes(dataHash)

      // Recursively pin the object
      await ipfs.pin.add(objHash, { recursive: true })

      // The data should now be indirectly pinned
      const pins = await ipfs.pin.ls()
      expect(pins.find(p => p.hash === dataHash).type).to.eql('indirect')

      // Run garbage collection
      await ipfs.repo.gc()

      // Get the list of local blocks after GC, should still contain the data
      // hash, because the data is still (indirectly) pinned
      const refsAfterGc = await ipfs.refs.local()
      expect(refsAfterGc.map(r => r.ref)).includes(dataHash)

      // Recursively unpin the object
      await ipfs.pin.rm(objHash)

      // Run garbage collection
      await ipfs.repo.gc()

      // The list of local blocks should no longer contain the hashes
      const refsAfterUnpinAndGc = await ipfs.refs.local()
      const hashesAfterUnpinAndGc = refsAfterUnpinAndGc.map(r => r.ref)
      expect(hashesAfterUnpinAndGc).not.includes(objHash)
      expect(hashesAfterUnpinAndGc).not.includes(dataHash)
    })
  })
}

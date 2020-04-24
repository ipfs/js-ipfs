/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const last = require('it-last')
const { Buffer } = require('buffer')
const factory = require('../utils/factory')
const pEvent = require('p-event')

// We need to detect when a readLock or writeLock is requested for the tests
// so we override the Mutex class to emit an event
const EventEmitter = require('events')
// const Mutex = require('../../src/utils/mutex')

class MutexEmitter /* extends Mutex */ {
  constructor (repoOwner) {
    // super(repoOwner)
    this.emitter = new EventEmitter()
  }

  readLock () {
    setTimeout(() => {
      this.emitter.emit('readLock request')
    }, 100)

    return super.readLock()
  }

  writeLock () {
    setTimeout(() => {
      this.emitter.emit('writeLock request')
    }, 100)

    return super.writeLock()
  }
}

// TODO: there's no way to access the gcLock instance anymore - decide what to do with these tests
describe.skip('gc', function () {
  this.timeout(40 * 1000)
  const df = factory()
  const fixtures = [{
    path: 'test/my/path1',
    content: Buffer.from('path1')
  }, {
    path: 'test/my/path2',
    content: Buffer.from('path2')
  }, {
    path: 'test/my/path3',
    content: Buffer.from('path3')
  }, {
    path: 'test/my/path4',
    content: Buffer.from('path4')
  }]

  let ipfsd
  let ipfs
  let lockEmitter

  before(async function () {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api

    // Replace the Mutex with one that emits events when a readLock or
    // writeLock is requested (needed in the tests below)
    ipfs._gcLock.mutex = new MutexEmitter(ipfs._options.repoOwner)
    lockEmitter = ipfs._gcLock.mutex.emitter
  })

  after(() => df.clean())

  const blockAddTests = [{
    name: 'add',
    add1: () => last(ipfs.add(fixtures[0], { pin: false })),
    add2: () => last(ipfs.add(fixtures[1], { pin: false })),
    resToCid: (res) => res[0].cid.toString()
  }, {
    name: 'object put',
    add1: () => ipfs.object.put({ Data: 'obj put 1', Links: [] }),
    add2: () => ipfs.object.put({ Data: 'obj put 2', Links: [] }),
    resToCid: (res) => res.toString()
  }, {
    name: 'block put',
    add1: () => ipfs.block.put(Buffer.from('block put 1'), null),
    add2: () => ipfs.block.put(Buffer.from('block put 2'), null),
    resToCid: (res) => res.cid.toString()
  }]

  describe('locks', function () {
    for (const test of blockAddTests) {
      // eslint-disable-next-line no-loop-func
      it(`garbage collection should wait for pending ${test.name} to finish`, async () => {
        // Add blocks to IPFS
        // Note: add operation will take a read lock
        const addLockRequested = pEvent(lockEmitter, 'readLock request')
        const add1 = test.add1()

        // Once add lock has been requested, start GC
        await addLockRequested
        // Note: GC will take a write lock
        const gcStarted = pEvent(lockEmitter, 'writeLock request')
        const gc = ipfs.repo.gc()

        // Once GC has started, start second add
        await gcStarted
        const add2 = test.add2()

        const deleted = (await gc).map(i => i.cid.toString())
        const add1Res = test.resToCid(await add1)
        const add2Res = test.resToCid(await add2)

        // Should have garbage collected blocks from first add, because GC should
        // have waited for first add to finish
        expect(deleted).includes(add1Res)

        // Should not have garbage collected blocks from second add, because
        // second add should have waited for GC to finish
        expect(deleted).not.includes(add2Res)
      })
    }

    it('garbage collection should wait for pending add + pin to finish', async () => {
      // Add blocks to IPFS
      // Note: add operation will take a read lock
      const addLockRequested = pEvent(lockEmitter, 'readLock request')
      const add1 = ipfs.add(fixtures[2], { pin: true })

      // Once add lock has been requested, start GC
      await addLockRequested
      // Note: GC will take a write lock
      const gcStarted = pEvent(lockEmitter, 'writeLock request')
      const gc = ipfs.repo.gc()

      // Once GC has started, start second add
      await gcStarted
      const add2 = ipfs.add(fixtures[3], { pin: true })

      const deleted = (await gc).map(i => i.cid.toString())
      const add1Res = (await add1)[0].hash
      const add2Res = (await add2)[0].hash

      // Should not have garbage collected blocks from first add, because GC should
      // have waited for first add + pin to finish (protected by pin)
      expect(deleted).not.includes(add1Res)

      // Should not have garbage collected blocks from second add, because
      // second add should have waited for GC to finish
      expect(deleted).not.includes(add2Res)
    })

    it('garbage collection should wait for pending block rm to finish', async () => {
      // Add two blocks so that we can remove them
      const cid1 = (await ipfs.block.put(Buffer.from('block to rm 1'), null)).cid
      const cid2 = (await ipfs.block.put(Buffer.from('block to rm 2'), null)).cid

      // Remove first block from IPFS
      // Note: block rm will take a write lock
      const rmLockRequested = pEvent(lockEmitter, 'writeLock request')
      const rm1 = ipfs.block.rm(cid1)

      // Once rm lock has been requested, start GC
      await rmLockRequested
      // Note: GC will take a write lock
      const gcStarted = pEvent(lockEmitter, 'writeLock request')
      const gc = ipfs.repo.gc()

      // Once GC has started, start second rm
      await gcStarted
      const rm2 = ipfs.block.rm(cid2)

      const deleted = (await gc).map(i => i.cid.toString())
      await rm1

      // Second rm should fail because GC has already removed that block
      const results = await rm2
      const result = results
        .filter(result => result.hash === cid2.toString())
        .pop()
      expect(result).to.have.property('error').that.contains('block not found')

      // Confirm second block has been removed
      const localRefs = (await ipfs.refs.local()).map(r => r.ref)
      expect(localRefs).not.includes(cid2.toString())

      // Should not have garbage collected block from first block put, because
      // GC should have waited for first rm (removing first block put) to finish
      expect(deleted).not.includes(cid1.toString())

      // Should have garbage collected block from second block put, because GC
      // should have completed before second rm (removing second block put)
      expect(deleted).includes(cid2.toString())
    })

    it('garbage collection should wait for pending pin add to finish', async () => {
      // Add two blocks so that we can pin them
      const cid1 = (await ipfs.block.put(Buffer.from('block to pin add 1'), null)).cid
      const cid2 = (await ipfs.block.put(Buffer.from('block to pin add 2'), null)).cid

      // Pin first block
      // Note: pin add will take a read lock
      const pinLockRequested = pEvent(lockEmitter, 'readLock request')
      const pin1 = ipfs.pin.add(cid1)

      // Once pin lock has been requested, start GC
      await pinLockRequested
      const gc = ipfs.repo.gc()
      const deleted = (await gc).map(i => i.cid.toString())
      await pin1

      // TODO: Adding pin for removed block never returns, which means the lock
      // never gets released
      // const pin2 = ipfs.pin.add(cid2)

      // Confirm second second block has been removed
      const localRefs = (await ipfs.refs.local()).map(r => r.ref)
      expect(localRefs).not.includes(cid2.toString())

      // Should not have garbage collected block from first block put, because
      // GC should have waited for pin (protecting first block put) to finish
      expect(deleted).not.includes(cid1.toString())

      // Should have garbage collected block from second block put, because GC
      // should have completed before second pin
      expect(deleted).includes(cid2.toString())
    })

    it('garbage collection should wait for pending pin rm to finish', async () => {
      // Add two blocks so that we can pin them
      const cid1 = (await ipfs.block.put(Buffer.from('block to pin rm 1'), null)).cid
      const cid2 = (await ipfs.block.put(Buffer.from('block to pin rm 2'), null)).cid

      // Pin blocks
      await ipfs.pin.add(cid1)
      await ipfs.pin.add(cid2)

      // Unpin first block
      // Note: pin rm will take a read lock
      const pinLockRequested = pEvent(lockEmitter, 'readLock request')
      const pinRm1 = ipfs.pin.rm(cid1)

      // Once pin lock has been requested, start GC
      await pinLockRequested
      // Note: GC will take a write lock
      const gcStarted = pEvent(lockEmitter, 'writeLock request')
      const gc = ipfs.repo.gc()

      // Once GC has started, start second pin rm
      await gcStarted
      const pinRm2 = ipfs.pin.rm(cid2)

      const deleted = (await gc).map(i => i.cid.toString())
      await pinRm1
      await pinRm2

      // Should have garbage collected block from first block put, because
      // GC should have waited for pin rm (unpinning first block put) to finish
      expect(deleted).includes(cid1.toString())

      // Should not have garbage collected block from second block put, because
      // GC should have completed before second block was unpinned
      expect(deleted).not.includes(cid2.toString())
    })
  })
})

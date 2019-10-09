/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const IPFSFactory = require('ipfsd-ctl')
const pEvent = require('p-event')
const env = require('ipfs-utils/src/env')
const IPFS = require('../../src/core')
const CID = require('cids')
const base32 = require('base32.js')
const { Errors } = require('interface-datastore')

// We need to detect when a readLock or writeLock is requested for the tests
// so we override the Mutex class to emit an event
const EventEmitter = require('events')
const Mutex = require('../../src/utils/mutex')

class MutexEmitter extends Mutex {
  constructor (repoOwner) {
    super(repoOwner)
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

describe('gc', function () {
  this.timeout(40 * 1000)
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
    const factory = IPFSFactory.create({
      type: 'proc',
      exec: IPFS,
      IpfsClient: require('ipfs-http-client')
    })
    const config = { Bootstrap: [] }

    if (env.isNode) {
      config.Addresses = {
        Swarm: ['/ip4/127.0.0.1/tcp/0']
      }
    }

    ipfsd = await factory.spawn({ config })
    ipfs = ipfsd.api

    // Replace the Mutex with one that emits events when a readLock or
    // writeLock is requested (needed in the tests below)
    ipfs._gcLock.mutex = new MutexEmitter(ipfs._options.repoOwner)
    lockEmitter = ipfs._gcLock.mutex.emitter
  })

  after(() => {
    if (ipfsd) {
      return ipfsd.stop()
    }
  })

  const blockAddTests = [{
    name: 'add',
    add1: () => ipfs.add(fixtures[0], { pin: false }),
    add2: () => ipfs.add(fixtures[1], { pin: false }),
    resToMultihash: (res) => base32.encode(new CID(res[0].hash).multihash)
  }, {
    name: 'object put',
    add1: () => ipfs.object.put({ Data: 'obj put 1', Links: [] }),
    add2: () => ipfs.object.put({ Data: 'obj put 2', Links: [] }),
    resToMultihash: (res) => base32.encode(res.multihash)
  }, {
    name: 'block put',
    add1: () => ipfs.block.put(Buffer.from('block put 1'), null),
    add2: () => ipfs.block.put(Buffer.from('block put 2'), null),
    resToMultihash: (res) => base32.encode(res.cid.multihash)
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

        const deleted = (await gc).map(i => i.multihash)
        const add1Res = test.resToMultihash(await add1)
        const add2Res = test.resToMultihash(await add2)

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

      const deleted = (await gc).map(i => i.multihash)
      const add1Res = base32.encode(new CID((await add1)[0].hash).multihash)
      const add2Res = base32.encode(new CID((await add2)[0].hash).multihash)

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
      const cid1Multihash = base32.encode(cid1.multihash)
      const cid2 = (await ipfs.block.put(Buffer.from('block to rm 2'), null)).cid
      const cid2Multihash = base32.encode(cid2.multihash)

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

      const deleted = (await gc).map(i => i.multihash)
      const rm1Out = await rm1
      expect(rm1Out[0]).to.not.have.property('error')

      // Confirm second block has been removed
      const localMultihashes = (await ipfs.refs.local()).map(r => base32.encode(new CID(r.ref).multihash))
      expect(localMultihashes).not.includes(cid2Multihash)

      // Second rm should fail because GC has already removed that block
      expect((await rm2)[0])
        .to.have.property('error')
        .that.has.property('code').that.equal(Errors.dbDeleteFailedError().code)

      // Should not have garbage collected block from first block put, because
      // GC should have waited for first rm (removing first block put) to finish
      expect(deleted).not.includes(cid1Multihash)

      // Should have garbage collected block from second block put, because GC
      // should have completed before second rm (removing second block put)
      expect(deleted).includes(cid2Multihash)
    })

    it('garbage collection should wait for pending pin add to finish', async () => {
      // Add two blocks so that we can pin them
      const cid1 = (await ipfs.block.put(Buffer.from('block to test pin add 1'), null)).cid
      const cid2 = (await ipfs.block.put(Buffer.from('block to test pin add 2'), null)).cid
      const cid1Multihash = base32.encode(cid1.multihash)
      const cid2Multihash = base32.encode(cid2.multihash)

      // Pin first block
      // Note: pin add will take a read lock
      const pinLockRequested = pEvent(lockEmitter, 'readLock request')
      const pin1 = ipfs.pin.add(cid1)

      // Once pin lock has been requested, start GC
      await pinLockRequested
      const gc = ipfs.repo.gc()
      const deleted = (await gc).map(i => i.multihash)
      await pin1

      // TODO: Adding pin for removed block never returns, which means the lock
      // never gets released
      // const pin2 = ipfs.pin.add(cid2)

      // Confirm second second block has been removed
      const localMultihashes = (await ipfs.refs.local()).map(r => base32.encode(new CID(r.ref).multihash))
      expect(localMultihashes).not.includes(cid2Multihash)

      // Should not have garbage collected block from first block put, because
      // GC should have waited for pin (protecting first block put) to finish
      expect(deleted).not.includes(cid1Multihash)

      // Should have garbage collected block from second block put, because GC
      // should have completed before second pin
      expect(deleted).includes(cid2Multihash)
    })

    it('garbage collection should wait for pending pin rm to finish', async () => {
      // Add two blocks so that we can pin them
      const cid1 = (await ipfs.block.put(Buffer.from('block to pin rm 1'), null)).cid
      const cid2 = (await ipfs.block.put(Buffer.from('block to pin rm 2'), null)).cid
      const cid1Multihash = base32.encode(cid1.multihash)
      const cid2Multihash = base32.encode(cid2.multihash)

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

      const deleted = (await gc).map(i => i.multihash)
      await pinRm1
      await pinRm2

      // Should have garbage collected block from first block put, because
      // GC should have waited for pin rm (unpinning first block put) to finish
      expect(deleted).includes(cid1Multihash)

      // Should not have garbage collected block from second block put, because
      // GC should have completed before second block was unpinned
      expect(deleted).not.includes(cid2Multihash)
    })
  })
})

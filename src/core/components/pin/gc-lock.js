'use strict'

const pull = require('pull-stream/pull')
const pullThrough = require('pull-stream/throughs/through')
const pullAsyncMap = require('pull-stream/throughs/async-map')
const EventEmitter = require('events')
const Mutex = require('../../../utils/mutex')
const log = require('debug')('ipfs:gc:lock')

class GCLock extends EventEmitter {
  constructor (repoOwner) {
    super()

    this.mutex = new Mutex(repoOwner, { log })
  }

  readLock (lockedFn, cb) {
    this.emit(`readLock request`)
    return this.mutex.readLock(lockedFn, cb)
  }

  writeLock (lockedFn, cb) {
    this.emit(`writeLock request`)
    return this.mutex.writeLock(lockedFn, cb)
  }

  pullReadLock (lockedPullFn) {
    return this.pullLock('readLock', lockedPullFn)
  }

  pullWriteLock (lockedPullFn) {
    return this.pullLock('writeLock', lockedPullFn)
  }

  pullLock (type, lockedPullFn) {
    const pullLocker = new PullLocker(this, this.mutex, type, this.lockId++)

    return pull(
      pullLocker.take(),
      lockedPullFn(),
      pullLocker.release()
    )
  }
}

class PullLocker {
  constructor (emitter, mutex, type) {
    this.emitter = emitter
    this.mutex = mutex
    this.type = type

    // The function to call to release the lock. It is set when the lock is taken
    this.releaseLock = null
  }

  take () {
    return pull(
      pullAsyncMap((i, cb) => {
        if (this.lockRequested) {
          return cb(null, i)
        }
        this.lockRequested = true

        this.emitter.emit(`${this.type} request`)

        this.mutex[this.type]((releaseLock) => {
          cb(null, i)
          this.releaseLock = releaseLock
        })
      })
    )
  }

  // Releases the lock
  release () {
    return pullThrough(null, (err) => {
      this.releaseLock(err)
    })
  }
}

module.exports = GCLock

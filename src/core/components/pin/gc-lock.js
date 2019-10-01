'use strict'

const pull = require('pull-stream/pull')
const pullThrough = require('pull-stream/throughs/through')
const pullAsyncMap = require('pull-stream/throughs/async-map')
const Mutex = require('../../../utils/mutex')
const log = require('debug')('ipfs:gc:lock')

class GCLock {
  constructor (repoOwner, options) {
    options = options || {}

    this.mutex = new Mutex(repoOwner, { ...options, log })
  }

  readLock () {
    return this.mutex.readLock()
  }

  writeLock () {
    return this.mutex.writeLock()
  }

  pullReadLock (lockedPullFn) {
    return this.pullLock('readLock', lockedPullFn)
  }

  pullWriteLock (lockedPullFn) {
    return this.pullLock('writeLock', lockedPullFn)
  }

  pullLock (type, lockedPullFn) {
    const pullLocker = new PullLocker(this.mutex, type)

    return pull(
      pullLocker.take(),
      lockedPullFn(),
      pullLocker.release()
    )
  }
}

class PullLocker {
  constructor (mutex, type) {
    this.mutex = mutex
    this.type = type

    // The function to call to release the lock. It is set when the lock is taken
    this.releaseLock = null
  }

  take () {
    return pullAsyncMap((i, cb) => {
      // Check if the lock has already been acquired.
      // Note: new items will only come through the pull stream once the first
      // item has acquired a lock.
      if (this.releaseLock) {
        // The lock has been acquired so return immediately
        return cb(null, i)
      }

      // Request the lock
      this.mutex[this.type]()
        .then(release => {
          // Save the release function to be called when the stream completes
          this.releaseLock = release

          // The lock has been granted, so run the locked piece of code
          cb(null, i)
        }, cb)
    })
  }

  // Releases the lock
  release () {
    return pullThrough(null, (err) => {
      // When the stream completes, release the lock
      this.releaseLock(err)
    })
  }
}

module.exports = GCLock

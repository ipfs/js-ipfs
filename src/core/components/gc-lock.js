'use strict'

const mortice = require('mortice')
const pull = require('pull-stream')
const log = require('debug')('ipfs:repo:gc:lock')

class GCLock {
  constructor () {
    this.mutex = mortice()
  }

  readLock (lockedFn, cb) {
    return this.lock('readLock', lockedFn, cb)
  }

  writeLock (lockedFn, cb) {
    return this.lock('writeLock', lockedFn, cb)
  }

  lock (type, lockedFn, cb) {
    log(`${type} requested`)
    const locked = () => new Promise((resolve, reject) => {
      log(`${type} started`)
      lockedFn((err, res) => err ? reject(err) : resolve(res))
    })

    const lock = this.mutex[type](locked)
    return lock.then(res => cb(null, res)).catch(cb).finally(() => {
      log(`${type} released`)
    })
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

    // This Promise resolves when the mutex gives us permission to start
    // running the locked piece of code
    this.lockReady = new Promise((resolve) => {
      this.lockReadyResolver = resolve
    })
  }

  // Returns a Promise that resolves when the locked piece of code completes
  locked () {
    return new Promise((resolve) => {
      this.releaseLock = resolve
      log(`${this.type} (pull) started`)

      // The locked piece of code is ready to start, so resolve the
      // this.lockReady Promise (created in the constructor)
      this.lockReadyResolver()
    })
  }

  // Requests a lock and then waits for the mutex to give us permission to run
  // the locked piece of code
  take () {
    return pull(
      pull.asyncMap((i, cb) => {
        if (!this.lock) {
          log(`${this.type} (pull) requested`)
          // Request the lock
          this.lock = this.mutex[this.type](() => this.locked())
        }

        // Wait for the mutex to give us permission
        this.lockReady.then(() => cb(null, i))
      })
    )
  }

  // Releases the lock
  release () {
    return pull.through(null, () => {
      log(`${this.type} (pull) released`)
      this.releaseLock()
    })
  }
}

module.exports = GCLock

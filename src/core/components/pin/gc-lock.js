'use strict'

const mortice = require('mortice')
const pull = require('pull-stream')
const EventEmitter = require('events')
const log = require('debug')('ipfs:gc:lock')

class GCLock extends EventEmitter {
  constructor (repoOwner) {
    super()

    // Ensure that we get a different mutex for each instance of GCLock
    // (There should only be one GCLock instance per IPFS instance, but
    // there may be multiple IPFS instances, eg in unit tests)
    const randId = (~~(Math.random() * 1e9)).toString(36) + Date.now()
    this.mutex = mortice(randId, {
      singleProcess: repoOwner
    })

    this.lockId = 0
  }

  readLock (lockedFn, cb) {
    return this.lock('readLock', lockedFn, cb)
  }

  writeLock (lockedFn, cb) {
    return this.lock('writeLock', lockedFn, cb)
  }

  lock (type, lockedFn, cb) {
    if (typeof lockedFn !== 'function') {
      throw new Error(`first argument to ${type} must be a function`)
    }
    if (typeof cb !== 'function') {
      throw new Error(`second argument to ${type} must be a callback function`)
    }

    const lockId = this.lockId++
    log(`[${lockId}] ${type} requested`)
    this.emit(`${type} request`, lockId)
    const locked = () => new Promise((resolve, reject) => {
      this.emit(`${type} start`, lockId)
      log(`[${lockId}] ${type} started`)
      lockedFn((err, res) => {
        this.emit(`${type} release`, lockId)
        log(`[${lockId}] ${type} released`)
        err ? reject(err) : resolve(res)
      })
    })

    const lock = this.mutex[type](locked)
    return lock.then(res => cb(null, res)).catch(cb)
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
  constructor (emitter, mutex, type, lockId) {
    this.emitter = emitter
    this.mutex = mutex
    this.type = type
    this.lockId = lockId

    // This Promise resolves when the mutex gives us permission to start
    // running the locked piece of code
    this.lockReady = new Promise((resolve) => {
      this.lockReadyResolver = resolve
    })
  }

  // Returns a Promise that resolves when the locked piece of code completes
  locked () {
    return new Promise((resolve, reject) => {
      this.releaseLock = (err) => err ? reject(err) : resolve()

      log(`[${this.lockId}] ${this.type} (pull) started`)
      this.emitter.emit(`${this.type} start`, this.lockId)

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
          log(`[${this.lockId}] ${this.type} (pull) requested`)
          this.emitter.emit(`${this.type} request`, this.lockId)
          // Request the lock
          this.lock = this.mutex[this.type](() => this.locked())
          // If there is an error, it gets passed through to the caller using
          // pull streams, so here we just catch the error and ignore it so
          // that there isn't an UnhandledPromiseRejectionWarning
          this.lock.catch(() => {})
        }

        // Wait for the mutex to give us permission
        this.lockReady.then(() => cb(null, i))
      })
    )
  }

  // Releases the lock
  release () {
    return pull.through(null, (err) => {
      log(`[${this.lockId}] ${this.type} (pull) released`)
      this.emitter.emit(`${this.type} release`, this.lockId)
      this.releaseLock(err)
    })
  }
}

module.exports = GCLock

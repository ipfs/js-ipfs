'use strict'

const assert = require('assert')
const mortice = require('mortice')
const setImmediate = require('async/setImmediate')
const noop = () => {}

// Wrap mortice to present a callback interface
class Mutex {
  constructor (repoOwner, options = {}) {
    this.mutex = mortice(options.morticeId, {
      singleProcess: repoOwner
    })

    this.log = options.log || noop
    this.lockId = 0
  }

  readLock (lockedFn, cb) {
    return this._lock('readLock', lockedFn, cb)
  }

  writeLock (lockedFn, cb) {
    return this._lock('writeLock', lockedFn, cb)
  }

  /**
  * Request a read or write lock
  *
  * @param {String} type The type of lock: readLock / writeLock
  * @param {function(releaseLock)} lockedFn A function that runs the locked piece of code and calls releaseLock when it completes
  * @param {function(err, res)} [cb] A function that is called when the locked function completes
  * @returns {void}
  */
  _lock (type, lockedFn, cb = noop) {
    assert(typeof lockedFn === 'function', `first argument to CBLock.${type}() must be a function`)
    assert(typeof cb === 'function', `second argument to CBLock.${type}() must be a callback function`)

    const lockId = this.lockId++
    this.log(`[${lockId}] ${type} requested`)

    // mortice presents a promise based API, so we need to give it a function
    // that returns a Promise.
    // The function is invoked when mortice gives permission to run the locked
    // piece of code
    const locked = () => new Promise((resolve, reject) => {
      this.log(`[${lockId}] ${type} started`)
      lockedFn((err, res) => {
        this.log(`[${lockId}] ${type} released`)
        err ? reject(err) : resolve(res)
      })
    })

    // Get a Promise for the lock
    const lock = this.mutex[type](locked)

    // When the locked piece of code is complete, the Promise resolves
    return lock.then(
      (res) => setImmediate(() => cb(null, res)),
      (err) => setImmediate(() => cb(err))
    )
  }
}

module.exports = Mutex

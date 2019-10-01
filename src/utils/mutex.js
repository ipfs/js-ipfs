'use strict'

const assert = require('assert')
const mortice = require('mortice')
const noop = () => {}

// Wrap mortice to present a callback interface
class Mutex {
  constructor (repoOwner, options) {
    options = options || {}

    this.mutex = mortice(options.morticeId, {
      singleProcess: repoOwner
    })

    this.log = options.log || noop
    this.lockId = 0
  }

  readLock () {
    return this._lock('readLock')
  }

  writeLock () {
    return this._lock('writeLock')
  }

  /**
  * Request a read or write lock
  *
  * @param {String} type The type of lock: readLock / writeLock
  * @returns {Promise}
  */
  async _lock (type) {
    assert(typeof type === 'string', `first argument to Mutex.${type}() must be a string, got ${typeof type}`)

    const lockId = this.lockId++
    this.log(`[${lockId}] ${type} requested`)

    // Get a Promise for the lock, wrap it for logging
    const release = await this.mutex[type]()

    this.log(`[${lockId}] ${type} started`)

    return () => {
      this.log(`[${lockId}] ${type} released`)
      release()
    }
  }
}

module.exports = Mutex

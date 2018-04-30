'use strict'

const PATH = require('path')

/**
 * Uses an object in an S3 bucket as a lock to signal that an IPFS repo is in use.
 * When the object exists, the repo is in use. You would normally use this to make
 * sure multiple IPFS nodes don’t use the same S3 bucket as a datastore at the same time.
 */
class S3Lock {
  constructor (s3Datastore) {
    this.s3 = s3Datastore
  }

  /**
   * Returns the location of the lock file given the path it should be located at
   *
   * @private
   * @param {string} dir
   * @returns {string}
   */
  getLockfilePath (dir) {
    return PATH.join(dir, 'repo.lock')
  }

  /**
   * Creates the lock. This can be overriden to customize where the lock should be created
   *
   * @param {string} dir
   * @param {function(Error, LockCloser)} callback
   * @returns {void}
   */
  lock (dir, callback) {
    const lockPath = this.getLockfilePath(dir)

    this.locked(dir, (err, alreadyLocked) => {
      if (err || alreadyLocked) {
        return callback(new Error('The repo is already locked'))
      }

      // There's no lock yet, create one
      this.s3.put(lockPath, Buffer.from(''), (err, data) => {
        if (err) {
          return callback(err, null)
        }

        callback(null, this.getCloser(lockPath))
      })
    })
  }

  /**
   * Returns a LockCloser, which has a `close` method for removing the lock located at `lockPath`
   *
   * @param {string} lockPath
   * @returns {LockCloser}
   */
  getCloser (lockPath) {
    return {
      /**
       * Removes the lock. This can be overriden to customize how the lock is removed. This
       * is important for removing any created locks.
       *
       * @param {function(Error)} callback
       * @returns {void}
       */
      close: (callback) => {
        this.s3.delete(lockPath, (err) => {
          if (err && err.statusCode !== 404) {
            return callback(err)
          }

          callback(null)
        })
      }
    }
  }

  /**
   * Calls back on whether or not a lock exists. Override this method to customize how the check is made.
   *
   * @param {string} dir
   * @param {function(Error, boolean)} callback
   * @returns {void}
   */
  locked (dir, callback) {
    this.s3.get(this.getLockfilePath(dir), (err, data) => {
      if (err && err.message.match(/not found/)) {
        return callback(null, false)
      } else if (err) {
        return callback(err)
      }

      callback(null, true)
    })
  }
}

module.exports = S3Lock

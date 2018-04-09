'use strict'

const PATH = require('path')

class S3Locker {
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
   * @param {function(Error, S3Locker)} callback
   * @returns {void}
   */
  lock (dir, callback) {
    this.lockPath = this.getLockfilePath(dir)

    this.s3.put(this.lockPath, Buffer.from(''), (err, data) => {
      if (err) {
        return callback(err, null)
      }

      callback(null, this)
    })
  }

  /**
   * Removes the lock. This can be overriden to customize how the lock is removed. This
   * is important for removing any created locks.
   *
   * @param {function(Error)} callback
   * @returns {void}
   */
  close (callback) {
    this.s3.delete(this.lockPath, (err) => {
      if (err && err.statusCode !== 404) {
        return callback(err)
      }

      callback(null)
    })
  }

  /**
   * Calls back on whether or not a lock exists. Override this method to customize how the check is made.
   *
   * @param {string} path
   * @param {function(Error, boolean)} callback
   * @returns {void}
   */
  locked (path, callback) {
    this.s3.get(this.lockPath, (err, data) => {
      if (err && err.message.match(/not found/)) {
        return callback(err, false)
      } else if (err) {
        return callback(err)
      }

      callback(null, true)
    })
  }
}

module.exports = S3Locker

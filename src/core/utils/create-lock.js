'use strict'

const mortice = require('mortice')

let lock

module.exports = (repoOwner) => {
  if (lock) {
    return lock
  }

  const mutex = mortice({
    // ordinarily the main thread would store the read/write lock but
    // if we are the thread that owns the repo, we can store the lock
    // on this process even if we are a worker thread
    singleProcess: repoOwner
  })

  lock = {
    readLock: (func) => {
      return (...args) => {
        return mutex.readLock(() => {
          return func.apply(null, args)
        })
      }
    },

    writeLock: (func) => {
      return (...args) => {
        return mutex.writeLock(() => {
          return func.apply(null, args)
        })
      }
    }
  }

  return lock
}

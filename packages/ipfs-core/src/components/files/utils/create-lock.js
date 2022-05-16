import mortice from 'mortice'

/**
 * @typedef {object} Lock
 * @property {(fn: (...args: any) => any) => (...args: any) => any} readLock
 * @property {(fn: (...args: any) => any) => (...args: any) => any} writeLock
 */

/** @type {Lock} */
let lock

/**
 * @param {boolean} [repoOwner]
 */
export function createLock (repoOwner = false) {
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
      return async (...args) => {
        const releaseLock = await mutex.readLock()

        try {
          return await func.apply(null, args)
        } finally {
          releaseLock()
        }
      }
    },

    writeLock: (func) => {
      return async (...args) => {
        const releaseLock = await mutex.writeLock()

        try {
          return await func.apply(null, args)
        } finally {
          releaseLock()
        }
      }
    }
  }

  return lock
}

'use strict'

const mortice = require('mortice')
const log = require('debug')('ipfs:mfs:lock')

module.exports = (repoOwner) => {
  const mutex = mortice({
    // ordinarily the main thread would store the read/write lock but
    // if we are the thread that owns the repo, we can store the lock
    // on this process even if we are a worker thread
    singleProcess: repoOwner
  })

  const performOperation = (type, func, args, callback) => {
    log(`Queuing ${type} operation`)

    mutex[`${type}Lock`](() => {
      return new Promise((resolve, reject) => {
        args.push((error, result) => {
          log(`${type} operation callback invoked${error ? ' with error' : ''}`)
          if (error) {
            return reject(error)
          }

          resolve(result)
        })
        log(`Starting ${type} operation`)
        func.apply(null, args)
      })
    })
      .then((result) => {
        log(`Finished ${type} operation`)
        const cb = callback
        callback = null
        cb(null, result)
      })
      .catch((error) => {
        log(`Finished ${type} operation with error`)
        if (callback) {
          return callback(error)
        }

        log(`Callback already invoked for ${type} operation`)

        throw error
      })
  }

  return {
    readLock: (func) => {
      return function () {
        const args = Array.from(arguments)
        let callback = args.pop()

        performOperation('read', func, args, callback)
      }
    },

    writeLock: (func) => {
      return function () {
        const args = Array.from(arguments)
        let callback = args.pop()

        performOperation('write', func, args, callback)
      }
    }
  }
}

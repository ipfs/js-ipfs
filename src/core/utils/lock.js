'use strict'

const mutex = require('mortice')()
const log = require('debug')('mfs:lock')

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

module.exports = {
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

'use strict'

const mutex = require('key_mutex').mutex()

module.exports = {
  readLock: (func) => {
    return function () {
      const args = Array.prototype.slice.call(arguments)
      const callback = args.pop()

      mutex.rlock(() => {
        return new Promise((resolve, reject) => {
          args.push((error, result) => {
            if (error) {
              return reject(error)
            }

            resolve(result)
          })
          func.apply(null, args)
        })
      })
        .then((result) => callback(null, result))
        .catch((error) => callback(error))
    }
  },

  writeLock: function (func) {
    return function () {
      const args = Array.prototype.slice.call(arguments)
      const callback = args.pop()

      mutex.wlock(() => {
        return new Promise((resolve, reject) => {
          args.push((error, result) => {
            if (error) {
              return reject(error)
            }

            resolve(result)
          })
          func.apply(null, args)
        })
      })
        .then((result) => callback(null, result))
        .catch((error) => callback(error))
    }
  }
}

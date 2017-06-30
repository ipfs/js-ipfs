'use strict'

const promisify = require('promisify-es6')

module.exports = function config (self) {
  return {
    get: promisify((key, callback) => {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }

      if (!key) {
        return self._repo.config.get(callback)
      } else {
        return self._repo.config.get(key, callback)
      }
    }),
    set: promisify((key, value, callback) => {
      if (!key || typeof key !== 'string') {
        return callback(new Error('Invalid key type'))
      }

      if (value === undefined || Buffer.isBuffer(value)) {
        return callback(new Error('Invalid value type'))
      }

      self._repo.config.set(key, value, callback)
    }),
    replace: promisify((config, callback) => {
      self._repo.config.set(config, callback)
    })
  }
}

'use strict'

const promisify = require('promisify-es6')

module.exports = function config (self) {
  return {
    get: promisify((key, callback) => {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }

      return self._repo.config.get(key, callback)
    }),
    set: promisify((key, value, callback) => {
      self._repo.config.set(key, value, callback)
    }),
    replace: promisify((config, callback) => {
      self._repo.config.set(config, callback)
    })
  }
}

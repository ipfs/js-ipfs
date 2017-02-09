'use strict'

const promisify = require('promisify-es6')

module.exports = function dag (self) {
  return {
    put: promisify((dagNode, options, callback) => {
      self._ipldResolver.put(dagNode, options, callback)
    }),
    get: promisify((cid, path, options, callback) => {
      self._ipldResolver.get(cid, path, options, callback)
    })
  }
}

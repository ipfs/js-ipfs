'use strict'

const all = require('async-iterator-all')

module.exports = function (self) {
  // can't use callbackify because if `data` is a pull stream
  // it thinks we are passing a callback. This is why we can't have nice things.
  return (data, options, callback) => {
    if (!callback && typeof options === 'function') {
      callback = options
      options = {}
    }

    const result = all(self._addAsyncIterator(data, options))

    if (!callback) {
      return result
    }

    result.then((result) => callback(null, result), callback)
  }
}

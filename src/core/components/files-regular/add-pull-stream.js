'use strict'

const toPullStream = require('async-iterator-to-pull-stream')

module.exports = function (self) {
  return function addPullStream (options) {
    return toPullStream.transform((source) => {
      return self._addAsyncIterator(source, options)
    })
  }
}

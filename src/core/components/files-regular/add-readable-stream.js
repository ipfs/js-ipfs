'use strict'

const toStream = require('it-to-stream')

module.exports = function (self) {
  return function addReadableStream (options) {
    return toStream.transform(source => {
      return self._addAsyncIterator(source, options)
    }, {
      objectMode: true
    })
  }
}

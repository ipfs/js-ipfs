'use strict'

const toStream = require('it-to-stream')

module.exports = function (self) {
  return function refsLocalReadableStream () {
    return toStream.readable(self.refs._localAsyncIterator(), {
      objectMode: true
    })
  }
}

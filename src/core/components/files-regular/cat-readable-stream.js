'use strict'

const toStream = require('it-to-stream')

module.exports = function (self) {
  return function catReadableStream (ipfsPath, options) {
    return toStream.readable(self._catAsyncIterator(ipfsPath, options), {
      objectMode: true
    })
  }
}

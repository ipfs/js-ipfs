'use strict'

const toStream = require('it-to-stream')

module.exports = function (self) {
  return function lsReadableStream (ipfsPath, options) {
    return toStream.readable(self._lsAsyncIterator(ipfsPath, options), {
      objectMode: true
    })
  }
}

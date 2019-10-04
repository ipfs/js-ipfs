'use strict'

const toStream = require('it-to-stream')

module.exports = function (self) {
  return function refsReadableStream (ipfsPath, options) {
    return toStream.readable(self._refsAsyncIterator(ipfsPath, options), {
      objectMode: true
    })
  }
}

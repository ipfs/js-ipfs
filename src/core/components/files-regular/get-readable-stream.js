'use strict'

const toStream = require('it-to-stream')

module.exports = function (self) {
  return function getReadableStream (ipfsPath, options) {
    return toStream.readable((async function * () {
      for await (const file of self._getAsyncIterator(ipfsPath, options)) {
        if (file.content) {
          file.content = toStream.readable(file.content())
        }

        yield file
      }
    }()), {
      objectMode: true
    })
  }
}

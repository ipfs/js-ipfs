'use strict'

const toPullStream = require('async-iterator-to-pull-stream')

module.exports = function (self) {
  return function refsPullStream (ipfsPath, options) {
    return toPullStream.source(self._refsAsyncIterator(ipfsPath, options))
  }
}

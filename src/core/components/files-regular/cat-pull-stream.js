'use strict'

const toPullStream = require('async-iterator-to-pull-stream')

module.exports = function (self) {
  return function catPullStream (ipfsPath, options) {
    return toPullStream.source(self._catAsyncIterator(ipfsPath, options))
  }
}

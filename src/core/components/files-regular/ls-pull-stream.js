'use strict'

const toPullStream = require('async-iterator-to-pull-stream')

module.exports = function (self) {
  return function lsPullStream (ipfsPath, options) {
    return toPullStream.source(self._lsAsyncIterator(ipfsPath, options))
  }
}

'use strict'

const toPullStream = require('async-iterator-to-pull-stream')

module.exports = function (self) {
  return function refsLocalPullStream () {
    return toPullStream.source(self.refs._localAsyncIterator())
  }
}

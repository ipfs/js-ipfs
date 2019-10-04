'use strict'

const callbackify = require('callbackify')
const all = require('async-iterator-all')

module.exports = function (self) {
  return callbackify(async function refsLocal (ipfsPath, options) { // eslint-disable-line require-await
    return all(self.refs._localAsyncIterator(ipfsPath, options))
  })
}

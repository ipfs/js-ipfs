'use strict'

const callbackify = require('callbackify')
const all = require('async-iterator-all')

module.exports = function (self) {
  return callbackify.variadic(async function refs (ipfsPath, options) { // eslint-disable-line require-await
    return all(self._refsAsyncIterator(ipfsPath, options))
  })
}

// Preset format strings
module.exports.Format = {
  default: '<dst>',
  edges: '<src> -> <dst>'
}

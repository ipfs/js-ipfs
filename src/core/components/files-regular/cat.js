'use strict'

const callbackify = require('callbackify')
const all = require('async-iterator-all')

module.exports = function (self) {
  return callbackify.variadic(async function cat (ipfsPath, options) {
    return Buffer.concat(await all(self._catAsyncIterator(ipfsPath, options)))
  })
}

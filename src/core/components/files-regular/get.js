'use strict'

const callbackify = require('callbackify')
const all = require('async-iterator-all')

module.exports = function (self) {
  return callbackify.variadic(async function get (ipfsPath, options) { // eslint-disable-line require-await
    return all(async function * () {
      for await (const file of self._getAsyncIterator(ipfsPath, options)) {
        if (file.content) {
          file.content = Buffer.concat(await all(file.content()))
        }

        yield file
      }
    }())
  })
}

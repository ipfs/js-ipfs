'use strict'

const callbackify = require('callbackify')
const globSource = require('ipfs-utils/src/files/glob-source')
const all = require('async-iterator-all')

module.exports = self => {
  return callbackify.variadic(async (...args) => { // eslint-disable-line require-await
    const options = typeof args[args.length - 1] === 'string' ? {} : args.pop()

    return all(self._addAsyncIterator(globSource(...args, options), options))
  })
}

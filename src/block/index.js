'use strict'

const nodeify = require('promise-nodeify')
const callbackify = require('callbackify')
const { collectify } = require('../lib/converters')

module.exports = config => {
  const rm = require('./rm-async-iterator')(config)

  return {
    get: callbackify.variadic(require('./get')(config)),
    stat: callbackify.variadic(require('./stat')(config)),
    put: callbackify.variadic(require('./put')(config)),
    rm: (input, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(rm)(input, options), callback)
    },
    _rmAsyncIterator: rm
  }
}

'use strict'

const nodeify = require('promise-nodeify')
const moduleConfig = require('../utils/module-config')
const { collectify } = require('../lib/converters')

module.exports = (arg, config) => {
  const send = moduleConfig(arg)
  const rm = require('./rm-async-iterator')(config)

  return {
    get: require('./get')(send),
    stat: require('./stat')(send),
    put: require('./put')(send),
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

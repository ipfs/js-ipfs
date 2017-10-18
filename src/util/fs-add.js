'use strict'

const isNode = require('detect-node')
const promisify = require('promisify-es6')
const converter = require('../utils/converter')
const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((path, opts, callback) => {
    if (typeof opts === 'function' &&
        callback === undefined) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' &&
        typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    if (!isNode) {
      return callback(new Error('fsAdd does not work in the browser'))
    }

    if (typeof path !== 'string') {
      return callback(new Error('"path" must be a string'))
    }

    const request = { path: 'add', files: path, qs: opts }
    send.andTransform(request, converter, callback)
  })
}

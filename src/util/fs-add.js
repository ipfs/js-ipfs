'use strict'

const isNode = require('detect-node')
const promisify = require('promisify-es6')
const moduleConfig = require('../utils/module-config')
const SendOneFile = require('../utils/send-one-file-multiple-results')

module.exports = (arg) => {
  const sendOneFile = SendOneFile(moduleConfig(arg), 'add')

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

    sendOneFile(path, { qs: opts }, callback)
  })
}

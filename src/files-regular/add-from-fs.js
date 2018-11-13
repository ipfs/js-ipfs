'use strict'

const isNode = require('detect-node')
const promisify = require('promisify-es6')
const SendOneFile = require('../utils/send-one-file-multiple-results')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'add')

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

    const requestOpts = {
      qs: opts,
      converter: FileResultStreamConverter
    }
    sendOneFile(path, requestOpts, callback)
  })
}

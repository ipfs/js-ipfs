'use strict'

const isStream = require('is-stream')
const promisify = require('promisify-es6')
const DAGNodeStream = require('../utils/dagnode-stream')

module.exports = (send) => {
  return promisify((files, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    opts = opts || {}

    const ok = Buffer.isBuffer(files) ||
               isStream.readable(files) ||
               Array.isArray(files)

    if (!ok) {
      return callback(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    const request = { path: 'add', files: files, qs: opts }

    // Transform the response stream to DAGNode values
    const transform = (res, callback) => DAGNodeStream.streamToValue(send, res, callback)
    send.andTransform(request, transform, callback)
  })
}

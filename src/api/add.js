'use strict'

const isStream = require('isstream')
const promisify = require('promisify-es6')
const DAGNodeStream = require('../dagnode-stream')

module.exports = (send) => {
  return promisify((files, callback) => {
    const ok = Buffer.isBuffer(files) ||
               isStream.isReadable(files) ||
               Array.isArray(files)

    if (!ok) {
      return callback(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    const request = {
      path: 'add',
      files: files
    }

    // Transform the response stream to DAGNode values
    const transform = (res, callback) => DAGNodeStream.streamToValue(send, res, callback)
    send.andTransform(request, transform, callback)
  })
}

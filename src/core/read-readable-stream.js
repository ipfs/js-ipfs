'use strict'

const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const readPullStream = require('./read-pull-stream')
const toStream = require('pull-stream-to-stream')

module.exports = function mfsRead (ipfs) {
  return promisify((path, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    waterfall([
      (cb) => readPullStream(ipfs)(path, options, cb),
      (stream, cb) => cb(null, toStream.source(stream))
    ], callback)
  })
}

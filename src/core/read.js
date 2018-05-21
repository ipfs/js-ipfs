'use strict'

const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const waterfall = require('async/waterfall')
const readPullStream = require('./read-pull-stream')

module.exports = (ipfs) => {
  return function mfsRead (path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    waterfall([
      (cb) => readPullStream(ipfs)(path, options, cb),
      (stream, cb) => pull(
        stream,
        collect(cb)
      ),
      (buffers, cb) => {
        cb(null, Buffer.concat(buffers))
      }
    ], callback)
  }
}

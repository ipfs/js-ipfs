'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const waterfall = require('async/waterfall')
const readPullStream = require('./read-pull-stream')

module.exports = function mfsRead (ipfs) {
  return promisify((path, options, callback) => {
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
  })
}

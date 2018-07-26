'use strict'

const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const readPullStream = require('./read-pull-stream')

module.exports = (ipfs) => {
  return function mfsRead (path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    pull(
      readPullStream(ipfs)(path, options),
      collect((error, buffers) => {
        if (error) {
          return callback(error)
        }

        return callback(null, Buffer.concat(buffers))
      })
    )
  }
}

'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream')

module.exports = function (self) {
  return promisify((ipfsPath, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    pull(
      self.catPullStream(ipfsPath, options),
      pull.collect((err, buffers) => {
        if (err) { return callback(err) }
        callback(null, Buffer.concat(buffers))
      })
    )
  })
}

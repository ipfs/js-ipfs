'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream')

module.exports = function (self) {
  return promisify((ipfsPath, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}

    pull(
      self.lsPullStream(ipfsPath, options),
      pull.collect((err, values) => {
        if (err) {
          return callback(err)
        }
        callback(null, values)
      })
    )
  })
}

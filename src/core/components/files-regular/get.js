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
      self.getPullStream(ipfsPath, options),
      pull.asyncMap((file, cb) => {
        if (file.content) {
          pull(
            file.content,
            pull.collect((err, buffers) => {
              if (err) { return cb(err) }
              file.content = Buffer.concat(buffers)
              cb(null, file)
            })
          )
        } else {
          cb(null, file)
        }
      }),
      pull.collect(callback)
    )
  })
}

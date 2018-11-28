'use strict'

const {
  FILE_SEPARATOR
} = require('./utils')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const lsPullStream = require('./ls-pull-stream')

module.exports = (context) => {
  return function mfsLs (path, options, callback) {
    if (typeof path === 'function') {
      callback = path
      path = FILE_SEPARATOR
      options = {}
    }

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    pull(
      lsPullStream(context)(path, options),
      collect((err, files) => {
        if (err) {
          return callback(err)
        }

        // https://github.com/ipfs/go-ipfs/issues/5181
        if (options.sort) {
          return callback(null, files.sort((a, b) => {
            return a.name.localeCompare(b.name)
          }))
        }

        return callback(null, files)
      })
    )
  }
}

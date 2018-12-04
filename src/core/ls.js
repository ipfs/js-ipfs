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
      collect(callback)
    )
  }
}

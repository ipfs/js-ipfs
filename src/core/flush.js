'use strict'

const waterfall = require('async/waterfall')
const stat = require('./stat')

const {
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {}

module.exports = (context) => {
  return function mfsFlush (path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (typeof path === 'function') {
      callback = path
      options = {}
      path = FILE_SEPARATOR
    }

    if (!path) {
      path = FILE_SEPARATOR
    }

    options = Object.assign({}, defaultOptions, options)

    waterfall([
      (cb) => stat(context)(path, options, cb),
      (stats, cb) => cb()
    ], callback)
  }
}

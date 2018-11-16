'use strict'

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

    callback()
  }
}

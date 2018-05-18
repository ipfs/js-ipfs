'use strict'

const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const {
  traverseTo,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {}

module.exports = function mfsFlush (ipfs) {
  return promisify(function (path, options, callback) {
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
      (cb) => traverseTo(ipfs, path, {}, cb),
      (root, cb) => {
        cb()
      }
    ], callback)
  })
}

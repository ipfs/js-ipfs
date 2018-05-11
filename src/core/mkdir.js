'use strict'

const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const {
  updateMfsRoot,
  updateTree,
  traverseTo,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  parents: true,
  hash: undefined,
  cidVersion: undefined
}

module.exports = function mfsMkdir (ipfs) {
  return promisify((path, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, defaultOptions, options)

    if (!path) {
      return callback(new Error('no path given to Mkdir'))
    }

    path = path.trim()

    if (path === FILE_SEPARATOR) {
      return callback(options.parents ? null : new Error(`cannot create directory '${FILE_SEPARATOR}': Already exists`))
    }

    waterfall([
      (cb) => {
        traverseTo(ipfs, path, {
          parents: false,
          createLastComponent: false
        }, (error) => {
          if (!error) {
            return cb(new Error('Already exists'))
          }

          if (error.message.includes('did not exist')) {
            return cb()
          }

          return cb(error)
        })
      },
      (cb) => traverseTo(ipfs, path, {
        parents: options.parents,
        flush: options.flush,
        createLastComponent: true
      }, cb),
      (result, cb) => updateTree(ipfs, result, cb),
      (newRoot, next) => updateMfsRoot(ipfs, newRoot.node.multihash, next)
    ], callback)
  })
}

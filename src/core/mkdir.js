'use strict'

const waterfall = require('async/waterfall')
const log = require('debug')('ipfs:mfs:mkdir')
const {
  updateMfsRoot,
  updateTree,
  traverseTo,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  parents: false,
  hash: undefined,
  cidVersion: 0
}

module.exports = (ipfs) => {
  return function mfsMkdir (path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, defaultOptions, options)

    options.parents = options.p || options.parents
    options.cidVersion = options.cidVersion || 0

    if (!path) {
      return callback(new Error('no path given to Mkdir'))
    }

    path = path.trim()

    if (path === FILE_SEPARATOR) {
      return callback(options.parents ? null : new Error(`cannot create directory '${FILE_SEPARATOR}': Already exists`))
    }

    log(`Creating ${path}`)

    waterfall([
      (cb) => {
        traverseTo(ipfs, path, {
          parents: false,
          createLastComponent: false
        }, (error) => {
          if (!error) {
            log(`${path} already exists`)
            return cb(new Error('file already exists'))
          }

          if (error.message.includes('did not exist')) {
            log(`${path} did not exist`)
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
    ], (error) => {
      if (error && error.message.includes('file already exists') && options.parents) {
        // when the directory already exists and we are creating intermediate
        // directories, do not error out (consistent with mkdir -p)
        error = null
      }

      callback(error)
    })
  }
}

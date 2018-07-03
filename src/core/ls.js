'use strict'

const waterfall = require('async/waterfall')
const map = require('async/map')
const bs58 = require('bs58')
const UnixFs = require('ipfs-unixfs')
const {
  traverseTo,
  loadNode,
  FILE_SEPARATOR,
  FILE_TYPES
} = require('./utils')

const defaultOptions = {
  long: false
}

module.exports = (ipfs) => {
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

    options = Object.assign({}, defaultOptions, options)

    options.long = options.l || options.long

    waterfall([
      (cb) => traverseTo(ipfs, path, {}, cb),
      (result, cb) => {
        const meta = UnixFs.unmarshal(result.node.data)

        if (meta.type === 'directory') {
          map(result.node.links, (link, next) => {
            waterfall([
              (done) => loadNode(ipfs, link, done),
              (node, done) => {
                const meta = UnixFs.unmarshal(node.data)

                done(null, {
                  name: link.name,
                  type: meta.type,
                  hash: bs58.encode(node.multihash),
                  size: meta.fileSize() || 0
                })
              }
            ], next)
          }, cb)
        } else {
          cb(null, [{
            name: result.name,
            type: meta.type,
            hash: bs58.encode(result.node.multihash),
            size: meta.fileSize() || 0
          }])
        }
      },

      // https://github.com/ipfs/go-ipfs/issues/5026
      (files, cb) => cb(null, files.map(file => {
        if (FILE_TYPES.hasOwnProperty(file.type)) {
          file.type = FILE_TYPES[file.type]
        }

        if (!options.long) {
          file.type = 0
          file.size = 0
          file.hash = ''
        }

        return file
      })),

      // https://github.com/ipfs/go-ipfs/issues/5181
      (files, cb) => {
        if (options.long) {
          return cb(null, files.sort((a, b) => {
            return b.name.localeCompare(a.name)
          }))
        }

        cb(null, files)
      }
    ], callback)
  }
}

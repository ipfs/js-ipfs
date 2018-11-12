'use strict'

const waterfall = require('async/waterfall')
const map = require('async/map')
const UnixFs = require('ipfs-unixfs')
const {
  traverseTo,
  loadNode,
  formatCid,
  FILE_SEPARATOR,
  FILE_TYPES
} = require('./utils')

const defaultOptions = {
  long: false,
  cidBase: 'base58btc',
  unsorted: false
}

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

    options = Object.assign({}, defaultOptions, options)

    options.long = options.l || options.long

    waterfall([
      (cb) => traverseTo(context, path, {}, cb),
      (result, cb) => {
        const meta = UnixFs.unmarshal(result.node.data)

        if (meta.type === 'directory') {
          map(result.node.links, (link, next) => {
            waterfall([
              (done) => loadNode(context, link, done),
              ({ node, cid }, done) => {
                const meta = UnixFs.unmarshal(node.data)

                done(null, {
                  name: link.name,
                  type: meta.type,
                  hash: formatCid(cid, options.cidBase),
                  size: meta.fileSize() || 0
                })
              }
            ], next)
          }, cb)
        } else {
          cb(null, [{
            name: result.name,
            type: meta.type,
            hash: formatCid(result.cid, options.cidBase),
            size: meta.fileSize() || 0
          }])
        }
      },

      // https://github.com/ipfs/go-ipfs/issues/5181
      (files, cb) => {
        if (options.unsorted) {
          return cb(null, files)
        }

        return cb(null, files.sort((a, b) => {
          return b.name.localeCompare(a.name)
        }))
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
      }))
    ], callback)
  }
}

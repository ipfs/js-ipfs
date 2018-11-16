'use strict'

const waterfall = require('async/waterfall')
const UnixFs = require('ipfs-unixfs')
const exporter = require('ipfs-unixfs-exporter')
const {
  loadNode,
  formatCid,
  toMfsPath,
  FILE_SEPARATOR,
  FILE_TYPES
} = require('./utils')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')

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

    // if we are listing a file we want ls to return something
    // if it's a directory it's ok for the results to be empty
    let errorOnMissing = true

    waterfall([
      (cb) => toMfsPath(context, path, cb),
      ({ mfsPath, depth }, cb) => {
        const maxDepth = depth + 1

        pull(
          exporter(mfsPath, context.ipld, {
            maxDepth
          }),
          filter(node => {
            if (node.depth === depth && node.type === 'dir') {
              errorOnMissing = false
            }

            if (errorOnMissing) {
              return node.depth === depth
            }

            return node.depth === maxDepth
          }),

          // load DAGNodes for each file
          asyncMap((file, cb) => {
            if (!options.long) {
              return cb(null, {
                name: file.name,
                type: 0,
                size: 0,
                hash: ''
              })
            }

            loadNode(context, {
              cid: file.hash
            }, (err, result) => {
              if (err) {
                return cb(err)
              }

              const meta = UnixFs.unmarshal(result.node.data)

              cb(null, {
                name: file.name,
                type: meta.type,
                hash: formatCid(file.hash, options.cidBase),
                size: meta.fileSize() || 0
              })
            })
          }),
          collect(cb)
        )
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
        if (!options.long) {
          return file
        }

        if (FILE_TYPES.hasOwnProperty(file.type)) {
          file.type = FILE_TYPES[file.type]
        }

        return file
      })),

      (files, cb) => {
        if (!files.length && errorOnMissing) {
          return cb(new Error(path + ' does not exist'))
        }

        cb(null, files)
      }
    ], callback)
  }
}

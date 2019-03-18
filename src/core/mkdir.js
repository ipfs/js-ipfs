'use strict'

const waterfall = require('async/waterfall')
const asyncMap = require('async/map')
const log = require('debug')('ipfs:mfs:mkdir')
const exporter = require('ipfs-unixfs-exporter')
const pull = require('pull-stream/pull')
const filter = require('pull-stream/throughs/filter')
const map = require('pull-stream/throughs/map')
const collect = require('pull-stream/sinks/collect')
const {
  createNode,
  toMfsPath,
  toPathComponents,
  updateMfsRoot,
  updateTree,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  parents: false,
  hashAlg: 'sha2-256',
  cidVersion: 0,
  shardSplitThreshold: 1000,
  format: 'dag-pb',
  flush: true
}

module.exports = (context) => {
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

    const pathComponents = toPathComponents(path)

    waterfall([
      (cb) => toMfsPath(context, path, cb),
      // figure out the CID of the containing folder
      ({ mfsDirectory, mfsPath, root }, cb) => {
        const toExport = toPathComponents(mfsPath)
          .slice(1)

        let depth = 0

        let exported = ''

        pull(
          exporter(mfsPath, context.ipld, {
            fullPath: true
          }),
          // find the directory from each level in the filesystem
          filter(node => {
            if (node.name === toExport[depth]) {
              depth++

              return true
            }

            return false
          }),
          // load DAGNode for the containing folder
          map((node) => {
            const currentPath = `${exported}${exported ? '/' : ''}${toExport[node.depth]}`

            if (node.type !== 'dir') {
              throw new Error(`cannot access ${currentPath}: Not a directory`)
            }
            exported = currentPath

            return {
              cid: node.cid,
              name: node.name
            }
          }),
          collect(cb)
        )
      },
      // Update the MFS tree from the containingFolder upwards
      (trail, cb) => {
        pathComponents.unshift('/')

        // we managed to load all of the requested path segments so the
        // directory already exists
        if (trail.length === pathComponents.length) {
          return cb(new Error('file already exists'))
        }

        asyncMap(pathComponents.map((part, index) => ({ part, index })), ({ part, index }, cb) => {
          if (trail[index]) {
            return cb(null, {
              name: part,
              ...trail[index]
            })
          }

          // if we are not at the last path component and we are
          // not creating intermediate directories make a fuss
          if (index !== pathComponents.length - 1 && !options.parents) {
            return cb(new Error('file does not exist'))
          }

          waterfall([
            (done) => createNode(context, 'directory', options, done),
            ({ cid, node }, done) => {
              done(null, {
                cid,
                size: node.size,
                name: part
              })
            }
          ], cb)
        }, cb)
      },

      // update the tree from the leaf to the root
      (trail, cb) => updateTree(context, trail, options, cb),

      // Update the MFS record with the new CID for the root of the tree
      ({ cid }, cb) => updateMfsRoot(context, cid, cb)
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

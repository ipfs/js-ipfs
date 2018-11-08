'use strict'

const UnixFs = require('ipfs-unixfs')
const waterfall = require('async/waterfall')
const series = require('async/series')
const {
  DAGNode
} = require('ipld-dag-pb')
const {
  traverseTo,
  updateTree,
  updateMfsRoot,
  toSources,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  recursive: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  codec: 'dag-pb'
}

module.exports = (context) => {
  return function mfsRm () {
    const args = Array.from(arguments)
    const {
      sources,
      options,
      callback
    } = toSources(args, defaultOptions)

    if (!sources.length) {
      return callback(new Error('Please supply at least one path to remove'))
    }

    series(
      sources.map(source => {
        return (done) => removePath(context, source.path, options, done)
      }),
      (error) => callback(error)
    )
  }
}

const removePath = (context, path, options, callback) => {
  if (path === FILE_SEPARATOR) {
    return callback(new Error('Cannot delete root'))
  }

  waterfall([
    (cb) => traverseTo(context, path, {
      withCreateHint: false
    }, cb),
    (result, cb) => {
      const meta = UnixFs.unmarshal(result.node.data)

      if (meta.type === 'directory' && !options.recursive) {
        return cb(new Error(`${path} is a directory, use -r to remove directories`))
      }

      waterfall([
        (next) => DAGNode.rmLink(result.parent.node, result.name, next),
        (newParentNode, next) => {
          context.ipld.put(newParentNode, {
            version: options.cidVersion,
            format: options.codec,
            hashAlg: options.hashAlg
          }, (error, cid) => next(error, {
            node: newParentNode,
            cid
          }))
        },
        ({ node, cid }, next) => {
          result.parent.node = node
          result.parent.cid = cid

          updateTree(context, result.parent, next)
        },
        (newRoot, next) => updateMfsRoot(context, newRoot.cid, next)
      ], cb)
    }
  ], callback)
}

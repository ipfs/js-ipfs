'use strict'

const UnixFs = require('ipfs-unixfs')
const waterfall = require('async/waterfall')
const series = require('async/series')
const {
  DAGNode
} = require('ipld-dag-pb')
const CID = require('cids')
const {
  traverseTo,
  updateTree,
  updateMfsRoot,
  toSources,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  recursive: false
}

module.exports = (ipfs) => {
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
        return (done) => removePath(ipfs, source.path, options, done)
      }),
      (error) => callback(error)
    )
  }
}

const removePath = (ipfs, path, options, callback) => {
  if (path === FILE_SEPARATOR) {
    return callback(new Error('Cannot delete root'))
  }

  waterfall([
    (cb) => traverseTo(ipfs, path, {
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
          ipfs.dag.put(newParentNode, {
            cid: new CID(newParentNode.hash || newParentNode.multihash)
          }, (error) => next(error, newParentNode))
        },
        (newParentNode, next) => {
          result.parent.node = newParentNode

          updateTree(ipfs, result.parent, next)
        },
        (newRoot, next) => updateMfsRoot(ipfs, newRoot.node.multihash, next)
      ], cb)
    }
  ], callback)
}

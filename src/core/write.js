'use strict'

const importer = require('ipfs-unixfs-engine').importer
const promisify = require('promisify-es6')
const CID = require('cids')
const pull = require('pull-stream')
const {
  collect,
  values
} = pull
const {
  waterfall
} = require('async')
const {
  updateMfsRoot,
  validatePath,
  traverseTo,
  addLink,
  updateTree,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  offset: 0,
  count: undefined,
  create: false,
  truncate: false,
  length: undefined,
  rawLeaves: false,
  cidVersion: undefined,
  hash: undefined,
  parents: false,
  progress: undefined,
  strategy: 'balanced',
  flush: true
}

module.exports = function mfsWrite (ipfs) {
  return promisify((path, buffer, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, defaultOptions, options)

    try {
      path = validatePath(path)
    } catch (error) {
      return callback(error)
    }

    if (options.count === 0) {
      return callback()
    }

    if (options.count) {
      buffer = buffer.slice(0, options.count)
    }

    const parts = path
      .split(FILE_SEPARATOR)
      .filter(Boolean)
    const fileName = parts.pop()

    waterfall([
      // walk the mfs tree to the containing folder node
      (done) => traverseTo(ipfs, `${FILE_SEPARATOR}${parts.join(FILE_SEPARATOR)}`, options, done),
      (containingFolder, done) => {
        waterfall([
          (next) => {
            const existingChild = containingFolder.node.links.reduce((last, child) => {
              if (child.name === fileName) {
                return child
              }

              return last
            }, null)

            if (existingChild) {
              // overwrite the existing file or part of it
              return next(new Error('Not implemented yet!'))
            } else {
              // import the file to IPFS and add it as a child of the containing directory
              return pull(
                values([{
                  content: buffer
                }]),
                importer(ipfs._ipld, {
                  progress: options.progress,
                  hashAlg: options.hash,
                  cidVersion: options.cidVersion,
                  strategy: options.strategy
                }),
                collect(next)
              )
            }
          },
          // load the DAGNode corresponding to the newly added/updated file
          (results, next) => ipfs.dag.get(new CID(results[0].multihash), next),
          (result, next) => {
            // link the newly added DAGNode to the containing older
            waterfall([
              (cb) => addLink(ipfs, {
                parent: containingFolder.node,
                child: result.value,
                name: fileName
              }, cb),
              (newContainingFolder, cb) => {
                containingFolder.node = newContainingFolder

                // update all the parent node CIDs
                updateTree(ipfs, containingFolder, cb)
              }
            ], next)
          },
          (result, next) => {
            // update new MFS root CID
            updateMfsRoot(ipfs, result.node.multihash, next)
          }
        ], done)
      }
    ], callback)
  })
}

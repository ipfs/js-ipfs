'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
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
} = require('../utils')
const log = require('debug')('mfs:write')
const bs58 = require('bs58')
const importNode = require('./import-node')
const updateNode = require('./update-node')

const defaultOptions = {
  offset: 0, // the offset in the file to begin writing
  length: undefined, // how many bytes from the incoming buffer to write
  create: false, // whether to create the file if it does not exist
  truncate: false, // whether to truncate the file first
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

    if (options.offset < 0) {
      return callback(new Error('cannot have negative write offset'))
    }

    if (options.length < 0) {
      return callback(new Error('cannot have negative byte count'))
    }

    if (options.length === 0) {
      return callback()
    }

    if (options.length) {
      buffer = buffer.slice(0, options.length)
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
              log('Updating linked DAGNode', bs58.encode(existingChild.multihash))
              // overwrite the existing file or part of it, possibly truncating what's left
              updateNode(ipfs, new CID(existingChild.multihash), buffer, options, next)
            } else {
              if (!options.create) {
                return next(new Error('file does not exist'))
              }

              if (options.offset) {
                // pad the start of the file with zeros
                buffer = Buffer.concat([Buffer.alloc(options.offset, 0), buffer])
              }

              log('Importing file', fileName, buffer.length, 'bytes')
              importNode(ipfs, containingFolder, fileName, buffer, options, next)
            }
          },

          // Add or replace the DAGLink in the containing directory
          (child, next) => addLink(ipfs, {
            parent: containingFolder.node,
            name: fileName,
            child: {
              multihash: child.multihash || child.hash,
              size: child.size
            },
            flush: options.flush
          }, (error, newContaingFolder) => {
            // Store new containing folder CID
            containingFolder.node = newContaingFolder

            next(error)
          }),

          // Update the MFS tree from the containingFolder upwards
          (next) => updateTree(ipfs, containingFolder, next),

          // Update the MFS record with the new CID for the root of the tree
          (newRoot, next) => updateMfsRoot(ipfs, newRoot.node.multihash, next)
        ], done)
      }
    ], callback)
  })
}

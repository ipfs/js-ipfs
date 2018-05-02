'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const waterfall = require('async/waterfall')
const {
  updateMfsRoot,
  validatePath,
  traverseTo,
  addLink,
  updateTree,
  FILE_SEPARATOR
} = require('../utils')
const values = require('pull-stream/sources/values')
const log = require('debug')('mfs:write')
const bs58 = require('bs58')
const importNode = require('./import-node')
const updateNode = require('./update-node')
const toPull = require('stream-to-pull-stream')
const isStream = require('is-stream')
const isNode = require('detect-node')
const fileReaderStream = require('filereader-stream')
const isPullStream = require('is-pull-stream')
const cat = require('pull-cat')

let fs

if (isNode) {
  fs = require('fs')
}

const defaultOptions = {
  offset: 0, // the offset in the file to begin writing
  length: undefined, // how many bytes from the incoming buffer to write
  create: false, // whether to create the file if it does not exist
  truncate: false, // whether to truncate the file first
  rawLeaves: false,
  cidVersion: undefined,
  hashAlg: 'sha2-256',
  format: 'dag-pb',
  parents: false, // whether to create intermediate directories if they do not exist
  progress: undefined,
  strategy: 'balanced',
  flush: true
}

const toPullSource = (content, options, callback) => {
  // Buffers
  if (Buffer.isBuffer(content)) {
    log('Content was a buffer')

    options.length = options.length || content.length

    return callback(null, values([content]))
  }

  // Paths, node only
  if (typeof content === 'string' || content instanceof String) {
    log('Content was a path')

    // Find out the file size if options.length has not been specified
    return waterfall([
      (done) => options.length ? done(null, {
        size: options.length
      }) : fs.stat(content, done),
      (stats, done) => {
        options.length = stats.size

        done(null, toPull.source(fs.createReadStream(content)))
      }
    ], callback)
  }

  // HTML5 Blob objects (including Files)
  if (global.Blob && content instanceof global.Blob) {
    log('Content was an HTML5 Blob')
    options.length = options.length || content.size

    content = fileReaderStream(content)
  }

  // Node streams
  if (isStream(content)) {
    log('Content was a Node stream')
    return callback(null, toPull.source(content))
  }

  // Pull stream
  if (isPullStream.isSource(content)) {
    log('Content was a pull-stream')
    return callback(null, content)
  }

  callback(new Error(`Don't know how to convert ${content} into a pull stream source`))
}

module.exports = function mfsWrite (ipfs) {
  return promisify((path, content, options, callback) => {
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

    const parts = path
      .split(FILE_SEPARATOR)
      .filter(Boolean)
    const fileName = parts.pop()

    waterfall([
      (done) => toPullSource(content, options, done),
      // walk the mfs tree to the containing folder node
      (source, done) => traverseTo(ipfs, `${FILE_SEPARATOR}${parts.join(FILE_SEPARATOR)}`, options, (error, result) => done(error, source, result)),
      (source, containingFolder, done) => {
        if (!options.length) {
          options.length = Infinity
        }

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
              updateNode(ipfs, new CID(existingChild.multihash), source, options, next)
            } else {
              if (!options.create) {
                return next(new Error('file does not exist'))
              }

              if (options.offset) {
                options.length += options.offset

                // pad the start of the stream with a buffer full of zeros
                source = cat([
                  values([Buffer.alloc(options.offset, 0)]),
                  source
                ])
              }

              log('Importing file', fileName)
              importNode(ipfs, containingFolder, fileName, source, options, next)
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

            log(`New CID for the containing folder is ${bs58.encode(newContaingFolder.multihash)}`)

            newContaingFolder.links.forEach(link => {
              log(`${link.name} ${bs58.encode(link.multihash)}`)
            })

            next(error)
          }),

          // Update the MFS tree from the containingFolder upwards
          (next) => updateTree(ipfs, containingFolder, next),

          // Update the MFS record with the new CID for the root of the tree
          (newRoot, next) => updateMfsRoot(ipfs, newRoot.node.multihash, next)
        ], done)
      }
    ], (error) => callback(error))
  })
}

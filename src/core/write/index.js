'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const {
  createLock,
  updateMfsRoot,
  validatePath,
  traverseTo,
  addLink,
  updateTree,
  limitStreamBytes,
  toPullSource
} = require('../utils')
const values = require('pull-stream/sources/values')
const log = require('debug')('ipfs:mfs:write')
const importNode = require('./import-node')
const updateNode = require('./update-node')
const cat = require('pull-cat')
const pull = require('pull-stream/pull')

const defaultOptions = {
  offset: 0, // the offset in the file to begin writing
  length: undefined, // how many bytes from the incoming buffer to write
  create: false, // whether to create the file if it does not exist
  truncate: false, // whether to truncate the file first
  rawLeaves: false,
  reduceSingleLeafToSelf: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  format: 'dag-pb',
  parents: false, // whether to create intermediate directories if they do not exist
  progress: undefined,
  strategy: 'trickle',
  flush: true,
  leafType: 'raw'
}

module.exports = function mfsWrite (ipfs) {
  return promisify((path, content, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, defaultOptions, options)

    if (options.offset < 0) {
      return callback(new Error('cannot have negative write offset'))
    }

    if (options.length < 0) {
      return callback(new Error('cannot have negative byte count'))
    }

    if (options.length === 0 && !options.truncate) {
      return callback()
    }

    if (!options.length) {
      options.length = Infinity
    }

    options.cidVersion = options.cidVersion || 0

    waterfall([
      (done) => {
        parallel([
          (next) => toPullSource(content, options, next),
          (next) => validatePath(path, next)
        ], done)
      },
      // walk the mfs tree to the containing folder node
      ([source, path], done) => {
        waterfall([
          (next) => {
            const opts = Object.assign({}, options, {
              createLastComponent: options.parents
            })

            if (opts.createLastComponent) {
              createLock().writeLock((callback) => {
                traverseTo(ipfs, path.directory, opts, (error, result) => callback(error, { source, containingFolder: result }))
              })(next)
            } else {
              createLock().readLock((callback) => {
                traverseTo(ipfs, path.directory, opts, (error, result) => callback(error, { source, containingFolder: result }))
              })(next)
            }
          },
          ({ source, containingFolder }, next) => {
            updateOrImport(ipfs, options, path, source, containingFolder, next)
          }
        ], done)
      }
    ], (error) => callback(error))
  })
}

const updateOrImport = (ipfs, options, path, source, containingFolder, callback) => {
  waterfall([
    (next) => {
      const existingChild = containingFolder.node.links.reduce((last, child) => {
        if (child.name === path.name) {
          return child
        }

        return last
      }, null)

      if (existingChild) {
        const cid = new CID(existingChild.multihash)
        log(`Updating linked DAGNode ${cid.toBaseEncodedString()}`)

        // overwrite the existing file or part of it, possibly truncating what's left
        updateNode(ipfs, cid, source, options, next)
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

        source = pull(
          source,
          limitStreamBytes(options.length)
        )

        log('Importing file', path.name)
        importNode(ipfs, source, options, next)
      }
    },

    // The slow bit is done, now add or replace the DAGLink in the containing directory
    // re-reading the path to the containing folder in case it has changed in the interim
    (child, next) => {
      createLock().writeLock((callback) => {
        const opts = Object.assign({}, options, {
          createLastComponent: options.parents
        })

        traverseTo(ipfs, path.directory, opts, (error, containingFolder) => {
          if (error) {
            return callback(error)
          }

          waterfall([
            (next) => {
              addLink(ipfs, {
                parent: containingFolder.node,
                name: path.name,
                child: {
                  multihash: child.multihash || child.hash,
                  size: child.size
                },
                flush: options.flush
              }, (error, newContaingFolder) => {
                // Store new containing folder CID
                containingFolder.node = newContaingFolder

                next(error)
              })
            },
            // Update the MFS tree from the containingFolder upwards
            (next) => updateTree(ipfs, containingFolder, next),

            // Update the MFS record with the new CID for the root of the tree
            (newRoot, next) => updateMfsRoot(ipfs, newRoot.node.multihash, next)
          ], callback)
        })
      })(next)
    }], callback)
}

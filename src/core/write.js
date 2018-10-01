'use strict'

const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const {
  createLock,
  updateMfsRoot,
  validatePath,
  traverseTo,
  addLink,
  updateTree,
  toPullSource,
  loadNode,
  limitStreamBytes,
  countStreamBytes,
  zeros
} = require('./utils')
const {
  unmarshal
} = require('ipfs-unixfs')
const pull = require('pull-stream/pull')
const cat = require('pull-cat')
const collect = require('pull-stream/sinks/collect')
const empty = require('pull-stream/sources/empty')
const err = require('pull-stream/sources/error')
const log = require('debug')('ipfs:mfs:write')
const values = require('pull-stream/sources/values')
const {
  exporter,
  importer
} = require('ipfs-unixfs-engine')
const deferred = require('pull-defer')
const CID = require('cids')

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

    if (!options.length && options.length !== 0) {
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
        return loadNode(ipfs, existingChild, next)
      }

      if (!options.create) {
        return next(new Error('file does not exist'))
      }

      next(null, null)
    },

    (existingChild, next) => {
      write(ipfs, existingChild, source, options, next)
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
          ], (error, result) => {
            callback(error, result)
          })
        })
      })(next)
    }], callback)
}

const write = (ipfs, existingNode, source, options, callback) => {
  let existingNodeCid
  let existingNodeMeta

  if (existingNode) {
    existingNodeCid = new CID(existingNode.multihash)
    existingNodeMeta = unmarshal(existingNode.data)
    log(`Overwriting file ${existingNodeCid.toBaseEncodedString()} offset ${options.offset} length ${options.length}`)
  } else {
    log(`Writing file offset ${options.offset} length ${options.length}`)
  }

  const sources = []

  // pad start of file if necessary
  if (options.offset > 0) {
    if (existingNode && existingNodeMeta.fileSize() > options.offset) {
      log(`Writing first ${options.offset} bytes of original file`)

      const startFile = deferred.source()

      sources.push(startFile)

      pull(
        exporter(existingNodeCid, ipfs.dag, {
          offset: 0,
          length: options.offset
        }),
        collect((error, files) => {
          if (error) {
            return startFile.resolve(err(error))
          }

          startFile.resolve(files[0].content)
        })
      )
    } else {
      log(`Writing zeros for first ${options.offset} bytes`)
      sources.push(zeros(options.offset))
    }
  }

  const endFile = deferred.source()

  // add the new source
  sources.push(
    pull(
      source,
      limitStreamBytes(options.length),
      countStreamBytes((bytesRead) => {
        log(`Wrote ${bytesRead} bytes`)

        if (existingNode && !options.truncate) {
          // if we've done reading from the new source and we are not going
          // to truncate the file, add the end of the existing file to the output
          const fileSize = existingNodeMeta.fileSize()
          const offset = options.offset + bytesRead

          if (fileSize > offset) {
            log(`Writing last ${fileSize - offset} of ${fileSize} bytes from original file`)
            pull(
              exporter(existingNodeCid, ipfs.dag, {
                offset
              }),
              collect((error, files) => {
                if (error) {
                  return endFile.resolve(err(error))
                }

                endFile.resolve(files[0].content)
              })
            )
          } else {
            log(`Not writing last bytes from original file`)
            endFile.resolve(empty())
          }
        }
      })
    )
  )

  // add the end of the file if necessary
  if (existingNode && !options.truncate) {
    sources.push(
      endFile
    )
  }

  pull(
    values([{
      path: '',
      content: cat(sources)
    }]),
    importer(ipfs.dag, {
      progress: options.progress,
      hashAlg: options.hash,
      cidVersion: options.cidVersion,
      strategy: options.strategy,
      rawLeaves: options.rawLeaves,
      reduceSingleLeafToSelf: options.reduceSingleLeafToSelf,
      leafType: options.leafType
    }),
    collect((error, results) => {
      if (error) {
        return callback(error)
      }

      const result = results.pop()

      log(`Wrote ${new CID(result.multihash).toBaseEncodedString()}`)

      callback(null, result)
    })
  )
}

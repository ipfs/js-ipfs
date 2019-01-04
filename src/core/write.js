'use strict'

const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const series = require('async/series')
const {
  createLock,
  updateMfsRoot,
  addLink,
  updateTree,
  toMfsPath,
  toPathComponents,
  toPullSource,
  loadNode,
  limitStreamBytes,
  countStreamBytes,
  toTrail,
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
const exporter = require('ipfs-unixfs-exporter')
const importer = require('ipfs-unixfs-importer')
const deferred = require('pull-defer')
const CID = require('cids')
const stat = require('./stat')
const mkdir = require('./mkdir')

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
  progress: () => {},
  strategy: 'trickle',
  flush: true,
  leafType: 'raw',
  shardSplitThreshold: 1000
}

module.exports = function mfsWrite (context) {
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
        createLock().readLock((callback) => {
          waterfall([
            (done) => {
              parallel({
                source: (next) => toPullSource(content, options, next),
                path: (next) => toMfsPath(context, path, next)
              }, done)
            },
            ({ source, path: { mfsPath, mfsDirectory } }, done) => {
              series({
                mfsDirectory: (next) => stat(context)(mfsDirectory, {
                  unsorted: true,
                  long: true
                }, (error, result) => {
                  if (error && error.message.includes('does not exist')) {
                    error = null
                  }

                  next(error, result)
                }),
                mfsPath: (next) => stat(context)(mfsPath, {
                  unsorted: true,
                  long: true
                }, (error, result) => {
                  if (error && error.message.includes('does not exist')) {
                    error = null
                  }

                  next(error, result)
                })
              }, (error, result = {}) => {
                done(error, {
                  source,
                  path,
                  mfsDirectory: result.mfsDirectory,
                  mfsPath: result.mfsPath
                })
              })
            }
          ], callback)
        })(done)
      },
      ({ source, path, mfsDirectory, mfsPath }, done) => {
        if (!options.parents && !mfsDirectory) {
          return done(new Error('directory does not exist'))
        }

        if (!options.create && !mfsPath) {
          return done(new Error('file does not exist'))
        }

        updateOrImport(context, options, path, source, mfsPath, done)
      }
    ], (error) => callback(error))
  })
}

const updateOrImport = (context, options, path, source, existingChild, callback) => {
  waterfall([
    (next) => {
      if (existingChild) {
        return loadNode(context, {
          cid: existingChild.hash
        }, next)
      }

      next(null, null)
    },

    (result, next) => {
      const {
        cid, node
      } = result || {}

      write(context, cid, node, source, options, next)
    },

    // The slow bit is done, now add or replace the DAGLink in the containing directory
    // re-reading the path to the containing folder in case it has changed in the interim
    (child, next) => {
      createLock().writeLock((writeLockCallback) => {
        const pathComponents = toPathComponents(path)
        const fileName = pathComponents.pop()

        waterfall([
          (cb) => stat(context)(`/${pathComponents.join('/')}`, options, (error, result) => {
            if (error && error.message.includes('does not exist')) {
              error = null
            }

            cb(null, Boolean(result))
          }),
          (parentExists, cb) => {
            if (parentExists) {
              return cb()
            }

            mkdir(context)(`/${pathComponents.join('/')}`, options, cb)
          },
          // get an updated mfs path in case the root changed while we were writing
          (cb) => toMfsPath(context, path, cb),
          ({ mfsDirectory, root }, cb) => {
            toTrail(context, mfsDirectory, options, (err, trail) => {
              if (err) {
                return cb(err)
              }

              const parent = trail[trail.length - 1]

              if (parent.type !== 'dir') {
                return cb(new Error(`cannot write to ${parent.name}: Not a directory`))
              }

              context.ipld.get(parent.cid, (err, result) => {
                if (err) {
                  return cb(err)
                }

                addLink(context, {
                  parent: result.value,
                  parentCid: parent.cid,
                  name: fileName,
                  cid: child.cid,
                  size: child.size,
                  flush: options.flush,
                  shardSplitThreshold: options.shardSplitThreshold
                }, (err, result) => {
                  if (err) {
                    return cb(err)
                  }

                  parent.cid = result.cid
                  parent.size = result.node.size

                  cb(null, trail)
                })
              })
            })
          },

          // update the tree with the new child
          (trail, cb) => updateTree(context, trail, options, cb),

          // Update the MFS record with the new CID for the root of the tree
          ({ cid }, cb) => updateMfsRoot(context, cid, cb)
        ], writeLockCallback)
      })(next)
    }], callback)
}

const write = (context, existingNodeCid, existingNode, source, options, callback) => {
  let existingNodeMeta

  if (existingNode) {
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
        exporter(existingNodeCid, context.ipld, {
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
              exporter(existingNodeCid, context.ipld, {
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
    importer(context.ipld, {
      progress: options.progress,
      hashAlg: options.hashAlg,
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
      const cid = new CID(result.multihash)

      log(`Wrote ${cid.toBaseEncodedString()}`)

      callback(null, {
        cid,
        size: result.size
      })
    })
  )
}

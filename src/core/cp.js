'use strict'

const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const {
  addLink,
  updateTree,
  updateMfsRoot,
  toTrail,
  toSourcesAndDestination,
  toMfsPath
} = require('./utils')
const stat = require('./stat')
const mkdir = require('./mkdir')
const log = require('debug')('ipfs:mfs:cp')

const defaultOptions = {
  parents: false,
  flush: true,
  format: 'dag-pb',
  hashAlg: 'sha2-256',
  shardSplitThreshold: 1000
}

module.exports = (context) => {
  return function mfsCp () {
    const args = Array.from(arguments)
    const callback = args.pop()

    waterfall([
      (cb) => toSourcesAndDestination(context, args, defaultOptions, cb),
      ({ sources, destination, options }, cb) => {
        if (!sources.length) {
          return cb(new Error('Please supply at least one source'))
        }

        if (!destination) {
          return cb(new Error('Please supply a destination'))
        }

        options.parents = options.p || options.parents

        cb(null, { sources, destination, options })
      },
      ({ sources, destination, options }, cb) => toTrail(context, destination.mfsPath, options, (error, trail) => {
        if (error) {
          return cb(error)
        }

        if (trail.length === destination.parts.length) {
          log('Destination does not exist')

          if (sources.length === 1) {
            log('Only one source, copying to a file')
            return copyToFile(context, sources.pop(), destination, trail, options, cb)
          }

          log('Multiple sources, copying to a directory')
          return copyToDirectory(context, sources, destination, trail, options, cb)
        }

        const parent = trail[trail.length - 1]

        if (parent.type === 'dir') {
          log('Destination is a directory')
          return copyToDirectory(context, sources, destination, trail, options, cb)
        }

        cb(new Error('directory already has entry by that name'))
      })
    ], callback)
  }
}

const copyToFile = (context, source, destination, destinationTrail, options, callback) => {
  waterfall([
    (cb) => asExistentTrail(context, source, options, cb),
    (sourceTrail, cb) => {
      const parent = destinationTrail[destinationTrail.length - 1]
      const child = sourceTrail[sourceTrail.length - 1]

      waterfall([
        (next) => context.ipld.get(parent.cid, next),
        (result, next) => addLink(context, {
          parent: result.value,
          parentCid: parent.cid,
          size: child.size,
          cid: child.cid,
          name: destination.parts[destination.parts.length - 1]
        }, next),
        ({ node, cid }, next) => {
          parent.node = node
          parent.cid = cid
          parent.size = node.size

          next(null, destinationTrail)
        }
      ], cb)
    },

    // update the tree with the new child
    (trail, cb) => updateTree(context, trail, options, cb),

    // Update the MFS record with the new CID for the root of the tree
    ({ cid }, cb) => updateMfsRoot(context, cid, cb)
  ], (error) => callback(error))
}

const copyToDirectory = (context, sources, destination, destinationTrail, options, callback) => {
  waterfall([
    (cb) => {
      if (destinationTrail.length !== (destination.parts.length + 1)) {
        log(`Making destination directory`, destination.path)

        return waterfall([
          (cb) => mkdir(context)(destination.path, options, cb),
          (cb) => toMfsPath(context, destination.path, cb),
          (mfsPath, cb) => {
            destination = mfsPath

            toTrail(context, destination.mfsPath, options, cb)
          }
        ], (err, trail) => {
          if (err) {
            return cb(err)
          }

          destinationTrail = trail

          cb()
        })
      }

      cb()
    },
    (cb) => parallel(
      sources.map(source => (next) => asExistentTrail(context, source, options, next)),
      cb
    ),
    (sourceTrails, cb) => {
      waterfall([
        // ensure targets do not exist
        (next) => {
          parallel(
            sources.map(source => {
              return (cb) => {
                stat(context)(`${destination.path}/${source.name}`, options, (error) => {
                  if (error) {
                    if (error.message.includes('does not exist')) {
                      return cb()
                    }

                    return cb(error)
                  }

                  cb(new Error('directory already has entry by that name'))
                })
              }
            }),
            (error) => next(error)
          )
        },
        // add links to target directory
        (next) => {
          const parent = destinationTrail[destinationTrail.length - 1]

          waterfall([
            (next) => context.ipld.get(parent.cid, next),
            (result, next) => next(null, { cid: parent.cid, node: result.value })
          ].concat(
            sourceTrails.map((sourceTrail, index) => {
              return (parent, done) => {
                const child = sourceTrail[sourceTrail.length - 1]

                log(`Adding ${sources[index].name} to ${parent.cid.toBaseEncodedString()}`)

                addLink(context, {
                  parent: parent.node,
                  parentCid: parent.cid,
                  size: child.size,
                  cid: child.cid,
                  name: sources[index].name
                }, (err, result) => {
                  if (err) {
                    return done(err)
                  }

                  log(`New directory hash ${result.cid.toBaseEncodedString()}`)

                  done(err, result)
                })
              }
            })
          ), next)
        },

        ({ node, cid }, next) => {
          const parent = destinationTrail[destinationTrail.length - 1]

          parent.node = node
          parent.cid = cid
          parent.size = node.size

          next(null, destinationTrail)
        },

        // update the tree with the new child
        (trail, next) => updateTree(context, trail, options, next),

        // Update the MFS record with the new CID for the root of the tree
        ({ cid }, next) => updateMfsRoot(context, cid, next)
      ], cb)
    }
  ], (error) => callback(error))
}

const asExistentTrail = (context, source, options, callback) => {
  toTrail(context, source.mfsPath, options, (err, trail) => {
    if (err) {
      return callback(err)
    }

    if (source.type === 'ipfs') {
      return callback(null, trail)
    }

    if (trail.length !== (source.parts.length + 1)) {
      return callback(new Error(`${source.path} does not exist`))
    }

    callback(null, trail)
  })
}

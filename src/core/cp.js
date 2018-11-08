'use strict'

const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const series = require('async/series')
const UnixFs = require('ipfs-unixfs')
const {
  traverseTo,
  addLink,
  updateTree,
  updateMfsRoot,
  toSourcesAndDestination
} = require('./utils')
const stat = require('./stat')
const log = require('debug')('ipfs:mfs:cp')

const defaultOptions = {
  parents: false,
  flush: true,
  format: 'dag-pb',
  hashAlg: 'sha2-256'
}

module.exports = (context) => {
  return function mfsCp () {
    const args = Array.from(arguments)
    const {
      sources,
      destination,
      options,
      callback
    } = toSourcesAndDestination(args, defaultOptions)

    if (!sources.length) {
      return callback(new Error('Please supply at least one source'))
    }

    if (!destination) {
      return callback(new Error('Please supply a destination'))
    }

    options.parents = options.p || options.parents

    traverseTo(context, destination.path, {}, (error, result) => {
      if (error) {
        if (sources.length === 1) {
          log('Only one source, copying to a file')
          return copyToFile(context, sources.pop(), destination, options, callback)
        } else {
          log('Multiple sources, copying to a directory')
          return copyToDirectory(context, sources, destination, options, callback)
        }
      }

      const meta = UnixFs.unmarshal(result.node.data)

      if (meta.type === 'directory') {
        return copyToDirectory(context, sources, destination, options, callback)
      }

      callback(new Error('directory already has entry by that name'))
    })
  }
}

const copyToFile = (context, source, destination, options, callback) => {
  waterfall([
    (cb) => {
      parallel([
        (next) => stat(context)(source.path, options, next),
        (next) => stat(context)(destination.path, options, (error) => {
          if (!error) {
            return next(new Error('directory already has entry by that name'))
          }

          next()
        }),
        (next) => traverseTo(context, destination.dir, options, next)
      ], cb)
    },
    ([sourceStats, _, dest], cb) => {
      waterfall([
        (next) => addLink(context, {
          parent: dest.node,
          size: sourceStats.cumulativeSize,
          cid: sourceStats.hash,
          name: destination.name
        }, next),
        ({ node, cid }, next) => {
          dest.node = node
          dest.cid = cid
          updateTree(context, dest, next)
        },
        ({ node, cid }, cb) => updateMfsRoot(context, cid, cb)
      ], cb)
    }
  ], (error) => callback(error))
}

const copyToDirectory = (context, sources, destination, options, callback) => {
  waterfall([
    (cb) => {
      series([
        // stat in parallel
        (done) => parallel(
          sources.map(source => (next) => stat(context)(source.path, options, next)),
          done
        ),
        // this could end up changing the root mfs node so do it after parallel
        (done) => traverseTo(context, destination.path, Object.assign({}, options, {
          createLastComponent: true
        }), done)
      ], cb)
    },
    (results, cb) => {
      const dest = results.pop()
      const sourceStats = results[0]

      waterfall([
        // ensure targets do not exist
        (next) => {
          parallel(
            sources.map(source => {
              return (cb) => {
                stat(context)(`${destination.path}/${source.name}`, options, (error) => {
                  if (!error) {
                    return cb(new Error('directory already has entry by that name'))
                  }

                  cb()
                })
              }
            }),
            (error) => next(error)
          )
        },
        // add links to target directory
        (next) => {
          waterfall([
            (done) => done(null, dest)
          ].concat(
            sourceStats.map((sourceStat, index) => {
              return (dest, done) => {
                return addLink(context, {
                  parent: dest.node,
                  size: sourceStat.cumulativeSize,
                  cid: sourceStat.hash,
                  name: sources[index].name
                }, done)
              }
            })
          ), next)
        },
        // update mfs tree
        ({ node, cid }, next) => {
          dest.node = node
          dest.cid = cid

          updateTree(context, dest, next)
        },
        // save new root CID
        (newRoot, cb) => updateMfsRoot(context, newRoot.cid, cb)
      ], cb)
    }
  ], (error) => callback(error))
}

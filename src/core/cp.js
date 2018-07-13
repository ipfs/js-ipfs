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

module.exports = (ipfs) => {
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

    traverseTo(ipfs, destination.path, {}, (error, result) => {
      if (error) {
        if (sources.length === 1) {
          log('Only one source, copying to a file')
          return copyToFile(ipfs, sources.pop(), destination, options, callback)
        } else {
          log('Multiple sources, copying to a directory')
          return copyToDirectory(ipfs, sources, destination, options, callback)
        }
      }

      const meta = UnixFs.unmarshal(result.node.data)

      if (meta.type === 'directory') {
        return copyToDirectory(ipfs, sources, destination, options, callback)
      }

      callback(new Error('directory already has entry by that name'))
    })
  }
}

const copyToFile = (ipfs, source, destination, options, callback) => {
  waterfall([
    (cb) => {
      parallel([
        (next) => stat(ipfs)(source.path, options, next),
        (next) => stat(ipfs)(destination.path, options, (error) => {
          if (!error) {
            return next(new Error('directory already has entry by that name'))
          }

          next()
        }),
        (next) => traverseTo(ipfs, destination.dir, options, next)
      ], cb)
    },
    ([sourceStats, _, dest], cb) => {
      waterfall([
        (next) => addLink(ipfs, {
          parent: dest.node,
          child: {
            size: sourceStats.cumulativeSize,
            hash: sourceStats.hash
          },
          name: destination.name
        }, next),
        (newParent, next) => {
          dest.node = newParent
          updateTree(ipfs, dest, next)
        },
        (newRoot, cb) => updateMfsRoot(ipfs, newRoot.node.multihash, cb)
      ], cb)
    }
  ], (error) => callback(error))
}

const copyToDirectory = (ipfs, sources, destination, options, callback) => {
  waterfall([
    (cb) => {
      series([
        // stat in parallel
        (done) => parallel(
          sources.map(source => (next) => stat(ipfs)(source.path, options, next)),
          done
        ),
        // this could end up changing the root mfs node so do it after parallel
        (done) => traverseTo(ipfs, destination.path, Object.assign({}, options, {
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
                stat(ipfs)(`${destination.path}/${source.name}`, options, (error) => {
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
            (done) => done(null, dest.node)
          ].concat(
            sourceStats.map((sourceStat, index) => {
              return (dest, done) => {
                return addLink(ipfs, {
                  parent: dest,
                  child: {
                    size: sourceStat.cumulativeSize,
                    hash: sourceStat.hash
                  },
                  name: sources[index].name
                }, done)
              }
            })
          ), next)
        },
        // update mfs tree
        (newParent, next) => {
          dest.node = newParent

          updateTree(ipfs, dest, next)
        },
        // save new root CID
        (newRoot, cb) => updateMfsRoot(ipfs, newRoot.node.multihash, cb)
      ], cb)
    }
  ], (error) => callback(error))
}

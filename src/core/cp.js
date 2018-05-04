'use strict'

const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const series = require('async/series')
const path = require('path')
const {
  traverseTo,
  addLink,
  updateTree,
  updateMfsRoot
} = require('./utils')
const stat = require('./stat')

const defaultOptions = {
  recursive: false,
  parents: false,
  flush: true,
  format: 'dag-pb',
  hashAlg: 'sha2-256'
}

module.exports = function mfsCp (ipfs) {
  return promisify(function () {
    const args = Array.prototype.slice.call(arguments)
    const callback = args.pop()

    if (args.length < 2) {
      return callback(new Error('Please specify a source(s) and a destination'))
    }

    let destination = args.pop()
    let options = {}

    if (typeof destination !== 'string') {
      options = destination
      destination = args.pop()
    }

    options = Object.assign({}, defaultOptions, options)

    const sources = args.map(source => ({
      path: source,
      name: path.basename(source),
      dir: path.dirname(source)
    }))

    destination = {
      path: destination,
      name: path.basename(destination),
      dir: path.dirname(destination)
    }

    if (sources.length < 1) {
      return callback(new Error('Please specify a path to copy'))
    }

    if (sources.length === 1) {
      return copyToFile(ipfs, sources.pop(), destination, options, callback)
    }

    copyToDirectory(ipfs, sources, destination, options, callback)
  })
}

const copyToFile = (ipfs, source, destination, options, callback) => {
  waterfall([
    (cb) => {
      parallel([
        (next) => stat(ipfs)(source.path, options, next),
        (next) => stat(ipfs)(destination.path, options, (error) => {
          if (!error) {
            return next(new Error('Destination exists'))
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
          child: sourceStats, // nb. file size here is not including protobuf wrapper so is wrong
          name: destination.name
        }, next),
        (newParent, next) => {
          dest.node = newParent
          updateTree(ipfs, dest, next)
        },
        (newRoot, cb) => updateMfsRoot(ipfs, newRoot.node.multihash, cb)
      ], cb)
    }
  ], callback)
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
        (next) => waterfall([
          (done) => done(null, dest.node)
        ].concat(
          sourceStats.map((sourceStat, index) => {
            return (dest, done) => {
              return addLink(ipfs, {
                parent: dest,
                child: sourceStat, // nb. file size here is not including protobuf wrapper so is wrong
                name: sources[index].name
              }, done)
            }
          })
        ), next),
        (newParent, next) => {
          dest.node = newParent

          updateTree(ipfs, dest, next)
        },
        (newRoot, cb) => updateMfsRoot(ipfs, newRoot.node.multihash, cb)
      ], cb)
    }
  ], callback)
}

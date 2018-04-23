'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const unmarshal = require('ipfs-unixfs').unmarshal
const promisify = require('promisify-es6')
const pull = require('pull-stream/pull')
const bs58 = require('bs58')
const CID = require('cids')
const collect = require('pull-stream/sinks/collect')
const {
  withMfsRoot,
  validatePath,
  traverseTo
} = require('./utils')
const waterfall = require('async/waterfall')

const defaultOptions = {
  hash: false,
  size: false,
  withLocal: false
}

module.exports = function mfsStat (ipfs) {
  return promisify((path, options, callback) => {
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

    waterfall([
      (done) => traverseTo(ipfs, path, options, done),
      ({ node }, done) => {
        if (options.hash) {
          return done(null, {
            hash: bs58.encode(node.multihash)
          })
        } else if (options.size) {
          return done(null, {
            size: node.size
          })
        }

        waterfall([
          (next) => ipfs.dag.get(new CID(node.multihash), next),
          (result, next) => next(null, result.value),
          (node, next) => {
            const meta = unmarshal(node.data)

            let size = 0

            if (meta.data && meta.data.length) {
              size = meta.data.length
            }

            if (meta.blockSizes && meta.blockSizes.length) {
              size = meta.blockSizes.reduce((acc, curr) => acc + curr, 0)
            }

            next(null, {
              hash: node.multihash,
              size: size,
              cumulativeSize: node.size,
              childBlocks: meta.blockSizes.length,
              type: meta.type
            })
          }
        ], done)
      }
    ], callback)
  })
}

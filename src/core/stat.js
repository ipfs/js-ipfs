'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const unmarshal = require('ipfs-unixfs').unmarshal
const promisify = require('promisify-es6')
const pull = require('pull-stream')
const bs58 = require('bs58')
const CID = require('cids')
const {
  collect
} = pull
const {
  withMfsRoot,
  validatePath
} = require('./utils')
const {
  waterfall
} = require('async')

const defaultOptions = {
  hash: false,
  size: false,
  withLocal: false
}

module.exports = function mfsStat (ipfs) {
  return promisify((path, options, callback) => {
    withMfsRoot(ipfs, (error, root) => {
      if (error) {
        return callback(error)
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = Object.assign({}, defaultOptions, options)

      try {
        path = validatePath(path)
        root = root.toBaseEncodedString()
      } catch (error) {
        return callback(error)
      }

      waterfall([
        (done) => pull(
          exporter(`/ipfs/${root}${path}`, ipfs._ipld),
          collect(done)
        ),
        (results, done) => {
          if (!results.length) {
            return done(new Error('file does not exist'))
          }

          done(null, results[0])
        },
        (result, done) => {
          if (options.hash) {
            return done(null, {
              hash: bs58.encode(result.hash)
            })
          } else if (options.size) {
            return done(null, {
              size: result.size
            })
          }

          waterfall([
            (next) => ipfs.dag.get(new CID(result.hash), next),
            (result, next) => next(null, result.value),
            (node, next) => {
              const data = unmarshal(node.data)

              next(null, {
                hash: node.multihash,
                size: data.blockSizes.reduce((acc, curr) => acc + curr, 0),
                cumulativeSize: node.size,
                childBlocks: node.links.length,
                type: data.type
              })
            }
          ], done)
        }
      ], callback)
    })
  })
}

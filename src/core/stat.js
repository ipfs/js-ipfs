'use strict'

const unmarshal = require('ipfs-unixfs').unmarshal
const promisify = require('promisify-es6')
const bs58 = require('bs58')
const CID = require('cids')
const {
  validatePath,
  traverseTo
} = require('./utils')
const waterfall = require('async/waterfall')
const log = require('debug')('mfs:stat')

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
        log('Traversed to', node)

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
            log('Node meta', meta)

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
    ], (error, stats) => {
      log(error, stats)

      callback(error, stats)
    })
  })
}

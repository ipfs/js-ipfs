'use strict'

const unmarshal = require('ipfs-unixfs').unmarshal
const bs58 = require('bs58')
const {
  traverseTo
} = require('./utils')
const waterfall = require('async/waterfall')
const log = require('debug')('ipfs:mfs:stat')

const defaultOptions = {
  hash: false,
  size: false,
  withLocal: false
}

module.exports = (ipfs) => {
  return function mfsStat (path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, defaultOptions, options)

    log(`Fetching stats for ${path}`)

    waterfall([
      (done) => traverseTo(ipfs, path, {
        withCreateHint: false
      }, done),
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

        const meta = unmarshal(node.data)

        let blocks = node.links.length

        if (meta.type === 'file') {
          blocks = meta.blockSizes.length
        }

        done(null, {
          hash: bs58.encode(node.multihash),
          size: meta.fileSize() || 0,
          cumulativeSize: node.size,
          blocks: blocks,
          type: meta.type,
          local: undefined,
          sizeLocal: undefined,
          withLocality: false
        })
      }
    ], callback)
  }
}

'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const waterfall = require('async/waterfall')
const {
  traverseTo
} = require('./utils')
const log = require('debug')('mfs:read-pull-stream')

const defaultOptions = {
  offset: 0,
  length: undefined
}

module.exports = (ipfs) => {
  return function mfsReadPullStream (path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, defaultOptions, options)

    log(`Reading ${path}`)

    waterfall([
      (done) => traverseTo(ipfs, path, {
        parents: false
      }, done),
      (result, done) => {
        waterfall([
          (next) => pull(
            exporter(result.node.multihash, ipfs._ipld, {
              offset: options.offset,
              length: options.length
            }),
            collect(next)
          ),
          (files, next) => next(null, files[0].content)
        ], done)
      }
    ], callback)
  }
}

'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const promisify = require('promisify-es6')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const waterfall = require('async/waterfall')
const {
  validatePath,
  traverseTo
} = require('./utils')
const log = require('debug')('mfs:read')

const defaultOptions = {
  offset: 0,
  length: undefined
}

module.exports = function mfsRead (ipfs) {
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
          (files, next) => pull(
            files[0].content,
            collect(next)
          ),
          (data, next) => next(null, Buffer.concat(data))
        ], done)
      }
    ], callback)
  })
}

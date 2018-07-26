'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const waterfall = require('async/waterfall')
const UnixFs = require('ipfs-unixfs')
const {
  traverseTo
} = require('./utils')
const log = require('debug')('ipfs:mfs:read-pull-stream')

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
        const node = result.node
        const meta = UnixFs.unmarshal(node.data)

        if (meta.type !== 'file') {
          return done(new Error(`${path} was not a file`))
        }

        waterfall([
          (next) => pull(
            exporter(node.multihash, ipfs.dag, {
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

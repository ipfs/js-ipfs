'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const promisify = require('promisify-es6')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const waterfall = require('async/waterfall')
const {
  withMfsRoot,
  validatePath
} = require('./utils')

const defaultOptions = {
  long: false
}

module.exports = function mfsLs (ipfs) {
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
          if (!results || !results.length) {
            return callback(new Error('file does not exist'))
          }

          done(null, results[0])
        },
        (result, done) => {
          const files = (result.links || []).map(link => ({
            name: link.name,
            type: link.type,
            size: link.size,
            hash: link.multihash
          }))

          done(null, files)
        }
      ], callback)
    })
  })
}

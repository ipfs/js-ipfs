'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const promisify = require('promisify-es6')
const pull = require('pull-stream')
const {
  collect
} = pull
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

      pull(
        exporter(`/ipfs/${root}${path}`, ipfs._ipld),
        collect((error, results) => {
          if (error) {
            return callback(error)
          }

          if (!results || !results.length) {
            return callback(new Error('file does not exist'))
          }

          const files = (results[0].links || []).map(link => ({
            name: link.name,
            type: link.type,
            size: link.size,
            hash: link.multihash
          }))

          callback(null, files)
        })
      )
    })
  })
}

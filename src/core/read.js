'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const promisify = require('promisify-es6')
const CID = require('cids')
const pull = require('pull-stream')
const {
  collect
} = pull
const {
  waterfall
} = require('async')
const {
  validatePath,
  traverseTo
} = require('./utils')

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

    waterfall([
      (done) => traverseTo(ipfs, path, {
        parents: false
      }, done),
      (file, done) => {
        pull(
          exporter(new CID(file.node.multihash), ipfs._ipld, {
            offset: options.offset,
            length: options.length
          }),
          collect((error, files) => {
            if (error) {
              return done(error)
            }

            pull(
              files[0].content,
              collect((error, data) => {
                if (error) {
                  return done(error)
                }

                done(null, Buffer.concat(data))
              })
            )
          })
        )
      }
    ], callback)
  })
}

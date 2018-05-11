'use strict'

const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const map = require('async/map')
const bs58 = require('bs58')
const UnixFs = require('ipfs-unixfs')
const {
  traverseTo,
  loadNode
} = require('./utils')

const defaultOptions = {}

module.exports = function mfsLs (ipfs) {
  return promisify((path, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = Object.assign({}, defaultOptions, options)

    waterfall([
      (cb) => traverseTo(ipfs, path, {}, cb),
      (result, cb) => {
        const meta = UnixFs.unmarshal(result.node.data)

        if (meta.type === 'directory') {
          map(result.node.links, (link, next) => {
            waterfall([
              (done) => loadNode(ipfs, link, done),
              (node, done) => {
                const meta = UnixFs.unmarshal(node.data)

                done(null, {
                  name: link.name,
                  type: meta.type,
                  hash: bs58.encode(node.multihash),
                  size: meta.fileSize() || 0
                })
              }
            ], next)
          }, cb)
        } else {
          cb(null, [{
            name: result.name,
            type: meta.type,
            hash: bs58.encode(result.node.multihash),
            size: meta.fileSize() || 0
          }])
        }
      }
    ], callback)
  })
}

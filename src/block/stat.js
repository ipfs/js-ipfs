'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const multihash = require('multihashes')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    // TODO this needs to be adjusted with the new go-ipfs http-api
    if (args && CID.isCID(args)) {
      args = multihash.toB58String(args.multihash)
    }

    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    const request = {
      path: 'block/stat',
      args: args,
      qs: opts
    }

    // Transform the response from { Key, Size } objects to { key, size } objects
    const transform = (stats, callback) => {
      callback(null, {
        key: stats.Key,
        size: stats.Size
      })
    }

    send.andTransform(request, transform, callback)
  })
}

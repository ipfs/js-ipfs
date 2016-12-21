'use strict'

const promisify = require('promisify-es6')
const cleanMultihash = require('../clean-multihash')
const TarStreamToObjects = require('../tar-stream-to-objects')

module.exports = (send) => {
  return promisify((path, opts, callback) => {
    if (typeof opts === 'function' &&
        !callback) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' &&
        typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    try {
      path = cleanMultihash(path)
    } catch (err) {
      return callback(err)
    }

    const request = {
      path: 'get',
      args: path,
      qs: opts
    }

    // Convert the response stream to TarStream objects
    send.andTransform(request, TarStreamToObjects, callback)
  })
}

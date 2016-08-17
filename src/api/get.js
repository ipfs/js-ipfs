'use strict'

const tarStreamToObjects = require('../tar-stream-to-objects')
const cleanMultihash = require('../clean-multihash')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify(function get (path, opts, callback) {
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

    var sendWithTransform = send.withTransform(tarStreamToObjects)

    sendWithTransform({
      path: 'get',
      args: path,
      qs: opts
    }, callback)
  })
}

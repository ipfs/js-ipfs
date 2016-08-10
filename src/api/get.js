'use strict'

const tarStreamToObjects = require('../tar-stream-to-objects')
const cleanMultihash = require('../clean-multihash')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify(function get (path, opts, cb) {
    if (typeof opts === 'function' && !cb) {
      cb = opts
      opts = {}
    }

    // opts is the real callback -- 'cb' is being injected by promisify
    if (typeof opts === 'function' && typeof cb === 'function') {
      cb = opts
      opts = {}
    }

    try {
      path = cleanMultihash(path)
    } catch (err) {
      return cb(err)
    }

    var sendWithTransform = send.withTransform(tarStreamToObjects)

    return sendWithTransform('get', path, opts, null, cb)
  })
}

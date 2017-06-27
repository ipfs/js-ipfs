'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')

module.exports = (send) => {
  return promisify((cid, opts, callback) => {
    if (typeof opts === 'function' && !callback) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' && typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'dht/findprovs',
      args: cid,
      qs: opts
    }, streamToValue, callback)
  })
}

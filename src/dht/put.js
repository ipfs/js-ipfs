'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((key, value, opts, callback) => {
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

    send({
      path: 'dht/put',
      args: [key, value],
      qs: opts
    }, callback)
  })
}

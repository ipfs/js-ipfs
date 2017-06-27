'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((pathDst, files, opts, callback) => {
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

    send({
      path: 'files/write',
      args: pathDst,
      qs: opts,
      files: files
    }, callback)
  })
}

'use strict'

const promisify = require('promisify-es6')
const cleanMultihash = require('../clean-multihash')

module.exports = (send) => {
  return promisify((hash, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    try {
      hash = cleanMultihash(hash)
    } catch (err) {
      return callback(err)
    }

    send({
      path: 'cat',
      args: hash,
      buffer: opts.buffer
    }, callback)
  })
}

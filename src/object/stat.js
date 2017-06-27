'use strict'

const promisify = require('promisify-es6')
const cleanMultihash = require('../utils/clean-multihash')

module.exports = (send) => {
  return promisify((multihash, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    if (!opts) {
      opts = {}
    }

    try {
      multihash = cleanMultihash(multihash, opts)
    } catch (err) {
      return callback(err)
    }

    send({
      path: 'object/stat',
      args: multihash
    }, callback)
  })
}

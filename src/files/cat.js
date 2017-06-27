'use strict'

const promisify = require('promisify-es6')
const cleanCID = require('../utils/clean-cid')
const v = require('is-ipfs')

module.exports = (send) => {
  return promisify((hash, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    try {
      hash = cleanCID(hash)
    } catch (err) {
      if (!v.ipfsPath(hash)) {
        return callback(err)
      }
    }

    send({
      path: 'cat',
      args: hash,
      buffer: opts.buffer
    }, callback)
  })
}

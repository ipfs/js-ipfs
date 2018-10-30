'use strict'

const promisify = require('promisify-es6')
const keys = require('lodash/keys')

module.exports = (send) => {
  return promisify((hash, opts, callback) => {
    if (typeof hash === 'function') {
      callback = hash
      opts = null
      hash = null
    }
    if (typeof opts === 'function') {
      callback = opts
      opts = null
    }
    if (hash && hash.type) {
      opts = hash
      hash = null
    }
    send({
      path: 'pin/ls',
      args: hash,
      qs: opts
    }, (err, res) => {
      if (err) {
        return callback(err)
      }
      callback(null, keys(res.Keys).map(hash => (
        { hash, type: res.Keys[hash].Type }
      )))
    })
  })
}

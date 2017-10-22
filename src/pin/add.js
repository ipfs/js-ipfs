'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((hash, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = null
    }
    send({
      path: 'pin/add',
      args: hash,
      qs: opts
    }, (err, res) => {
      if (err) {
        return callback(err)
      }
      callback(null, res.Pins.map((hash) => ({ hash: hash })))
    })
  })
}

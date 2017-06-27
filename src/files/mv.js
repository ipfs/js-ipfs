'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof opts === 'function' &&
      callback === undefined) {
      callback = opts
      opts = {}
    }
    send({
      path: 'files/mv',
      args: args,
      qs: opts
    }, callback)
  })
}

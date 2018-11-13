
'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    send({
      path: 'files/mkdir',
      args: args,
      qs: opts
    }, (error) => callback(error))
  })
}

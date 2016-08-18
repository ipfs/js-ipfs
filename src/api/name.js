'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    publish: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'name/publish',
        args: args,
        qs: opts
      }, callback)
    }),
    resolve: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'name/resolve',
        args: args,
        qs: opts
      }, callback)
    })
  }
}

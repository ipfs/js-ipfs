'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    wantlist: promisify((callback) => {
      send({
        path: 'bitswap/wantlist'
      }, callback)
    }),
    stat: promisify((callback) => {
      send({
        path: 'bitswap/stat'
      }, callback)
    }),
    unwant: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'bitswap/unwant',
        args: args,
        qs: opts
      }, callback)
    })
  }
}

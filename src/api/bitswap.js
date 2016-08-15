'use strict'

module.exports = (send) => {
  return {
    wantlist (callback) {
      return send({
        path: 'bitswap/wantlist'
      }, callback)
    },
    stat (callback) {
      return send({
        path: 'bitswap/stat'
      }, callback)
    },
    unwant (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'bitswap/unwant',
        args: args,
        qs: opts
      }, callback)
    }
  }
}

'use strict'

module.exports = (send) => {
  return {
    add (args, opts, callback) {
      if (typeof opts === 'function' &&
          callback === undefined) {
        callback = opts
        opts = {}
      }
      return send({
        path: 'bootstrap/add',
        args: args,
        qs: opts
      }, callback)
    },
    rm (args, opts, callback) {
      if (typeof opts === 'function' &&
          callback === undefined) {
        callback = opts
        opts = {}
      }
      return send({
        path: 'bootstrap/rm',
        args: args,
        qs: opts
      }, callback)
    },
    list (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'bootstrap/list',
        qs: opts
      }, callback)
    }
  }
}

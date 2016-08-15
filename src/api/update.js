'use strict'

module.exports = (send) => {
  return {
    apply (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'update',
        qs: opts
      }, callback)
    },
    check (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'update/check',
        qs: opts
      }, callback)
    },
    log (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'update/log',
        qs: opts
      }, callback)
    }
  }
}

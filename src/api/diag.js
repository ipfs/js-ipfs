'use strict'

module.exports = (send) => {
  return {
    net (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      return send({
        path: 'diag/net',
        qs: opts
      }, callback)
    },
    sys (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      return send({
        path: 'diag/sys',
        qs: opts
      }, callback)
    },
    cmds (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      return send({
        path: 'diag/cmds',
        qs: opts
      }, callback)
    }
  }
}

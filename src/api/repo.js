'use strict'

module.exports = (send) => {
  return {
    gc (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'repo/gc',
        qs: opts
      }, callback)
    },
    stat (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'repo/stat',
        qs: opts
      }, callback)
    }
  }
}

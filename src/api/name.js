'use strict'

module.exports = (send) => {
  return {
    publish (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'name/publish',
        args: args,
        qs: opts
      }, callback)
    },
    resolve (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'name/resolve',
        args: args,
        qs: opts
      }, callback)
    }
  }
}

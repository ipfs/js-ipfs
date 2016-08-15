'use strict'

module.exports = (send) => {
  const refs = (args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    return send({
      path: 'refs',
      args: args,
      qs: opts
    }, callback)
  }
  refs.local = (opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    return send({
      path: 'refs',
      qs: opts
    }, callback)
  }

  return refs
}

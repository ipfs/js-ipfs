'use strict'

module.exports = (send) => {
  return (args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    return send({
      path: 'ls',
      args: args,
      qs: opts
    }, callback)
  }
}

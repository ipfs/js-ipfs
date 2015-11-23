'use strict'

exports.command = function command (send, name) {
  return (opts, cb) => {
    if (typeof (opts) === 'function') {
      cb = opts
      opts = {}
    }
    return send(name, null, opts, null, cb)
  }
}

exports.argCommand = function argCommand (send, name) {
  return (arg, opts, cb) => {
    if (typeof (opts) === 'function') {
      cb = opts
      opts = {}
    }
    return send(name, arg, opts, null, cb)
  }
}

'use strict'

module.exports = (send) => {
  return function get (path, opts, cb) {
    if (typeof opts === 'function' && !cb) {
      cb = opts
      opts = {}
    }
    return send('get', path, opts, null, cb)
  }
}

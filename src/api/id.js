'use strict'

module.exports = (send) => {
  return function id (opts, callback) {
    if (typeof opts === 'function') {
      callback = opts
      opts = undefined
    }
    return send({
      path: 'id',
      args: opts
    }, callback)
  }
}

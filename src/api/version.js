'use strict'

module.exports = (send) => {
  return (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    return send({
      path: 'version',
      qs: opts
    }, callback)
  }
}

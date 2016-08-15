'use strict'

module.exports = (send) => {
  return function ping (id, callback) {
    if (typeof callback !== 'function' &&
        typeof Promise !== 'undefined') {
      return send({
        path: 'ping',
        args: id,
        qs: { n: 1 }
      }).then((res) => res[1])
    }

    return send({
      path: 'ping',
      args: id,
      qs: { n: 1 }
    }, function (err, res) {
      if (err) {
        return callback(err, null)
      }
      callback(null, res[1])
    })
  }
}

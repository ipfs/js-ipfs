'use strict'

module.exports = (send) => {
  return function ping (id, cb) {
    if (typeof cb !== 'function' && typeof Promise !== 'undefined') {
      return send('ping', id, {n: 1}, null)
        .then((res) => res[1])
    }

    return send('ping', id, { n: 1 }, null, function (err, res) {
      if (err) return cb(err, null)
      cb(null, res[1])
    })
  }
}

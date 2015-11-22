'use strict'

module.exports = send => {
  return function ping (id, cb) {
    return send('ping', id, { n: 1 }, null, function (err, res) {
      if (err) return cb(err, null)
      cb(null, res[1])
    })
  }
}

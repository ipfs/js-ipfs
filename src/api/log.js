'use strict'

const ndjson = require('ndjson')

module.exports = (send) => {
  return {
    tail (cb) {
      if (typeof cb !== 'function' && typeof Promise !== 'undefined') {
        return send('log/tail', null, {}, null, false)
          .then((res) => res.pipe(ndjson.parse()))
      }

      return send('log/tail', null, {}, null, false, (err, res) => {
        if (err) return cb(err)
        cb(null, res.pipe(ndjson.parse()))
      })
    }
  }
}

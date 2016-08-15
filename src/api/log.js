'use strict'

const ndjson = require('ndjson')

module.exports = (send) => {
  return {
    tail (callback) {
      if (typeof callback !== 'function' &&
          typeof Promise !== 'undefined') {
        return send({
          path: 'log/tail'
        }).then((res) => res.pipe(ndjson.parse()))
      }

      return send({
        path: 'log/tail'
      }, (err, response) => {
        if (err) {
          return callback(err)
        }
        callback(null, response.pipe(ndjson.parse()))
      })
    }
  }
}

'use strict'

const ndjson = require('ndjson')

module.exports = send => {
  return {
    tail (cb) {
      send('log/tail', null, {}, null, false, (err, res) => {
        if (err) return cb(err)
        cb(null, res.pipe(ndjson.parse()))
      })
    }
  }
}

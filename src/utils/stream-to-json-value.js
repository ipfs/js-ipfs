'use strict'

const streamToValue = require('./stream-to-value')

/*
  Converts a stream to a single JSON value
*/
function streamToJsonValue (res, cb) {
  streamToValue(res, (err, data) => {
    if (err) {
      return cb(err)
    }

    if (!data || data.length === 0) {
      return cb()
    }

    // TODO: check if needed, afaik JSON.parse can parse Buffers
    if (Buffer.isBuffer(data)) {
      data = data.toString()
    }

    let res
    try {
      res = JSON.parse(data)
    } catch (err) {
      return cb(err)
    }

    cb(null, res)
  })
}

module.exports = streamToJsonValue

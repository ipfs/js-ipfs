'use strict'

const streamToValue = require('./stream-to-value')

function streamToValueWithTransformer (response, transformer, callback) {
  if (typeof response.pipe === 'function') {
    streamToValue(response, (err, res) => {
      if (err) {
        return callback(err)
      }
      transformer(res, callback)
    })
  } else {
    transformer(response, callback)
  }
}

module.exports = streamToValueWithTransformer

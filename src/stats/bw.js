'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'stats/bw',
      qs: opts
    }, streamToValue, (err, stats) => {
      if (err) {
        return callback(err)
      }

      // streamToValue returns an array and we're only
      // interested in returning the object itself.
      callback(err, stats[0])
    })
  })
}

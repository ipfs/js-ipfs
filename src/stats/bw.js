'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')

const transform = function (res, callback) {
  streamToValue(res, (err, data) => {
    if (err) {
      return callback(err)
    }

    callback(null, {
      totalIn: data[0].TotalIn,
      totalOut: data[0].TotalOut,
      rateIn: data[0].RateIn,
      rateOut: data[0].RateOut
    })
  })
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'stats/bw',
      qs: opts
    }, transform, callback)
  })
}

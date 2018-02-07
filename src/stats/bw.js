'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../utils/stream-to-value')
const transformChunk = require('./bw-util')

const transform = (res, callback) => {
  return streamToValue(res, (err, data) => {
    if (err) {
      return callback(err)
    }

    callback(null, transformChunk(data[0]))
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

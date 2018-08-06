'use strict'

const promisify = require('promisify-es6')

const toObject = function (res, callback) {
  if (Buffer.isBuffer(res)) {
    callback(null, JSON.parse(res.toString()))
  } else {
    callback(null, res)
  }
}

module.exports = (send) => {
  return promisify((key, callback) => {
    if (typeof key === 'function') {
      callback = key
      key = undefined
    }

    if (!key) {
      send.andTransform({
        path: 'config/show',
        buffer: true
      }, toObject, callback)
      return
    }

    send.andTransform({
      path: 'config',
      args: key,
      buffer: true
    }, toObject, (err, response) => {
      if (err) {
        return callback(err)
      }
      callback(null, response.Value)
    })
  })
}

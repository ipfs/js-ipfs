'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((key, callback) => {
    if (typeof key === 'function') {
      callback = key
      key = undefined
    }

    if (!key) {
      send({
        path: 'config/show',
        buffer: true
      }, callback)
      return
    }

    send({
      path: 'config',
      args: key,
      buffer: true
    }, (err, response) => {
      if (err) {
        return callback(err)
      }
      callback(null, response.Value)
    })
  })
}

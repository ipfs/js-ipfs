'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, res.Keys.map(key => {
    return {
      id: key.Id,
      name: key.Name
    }
  }))
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'key/list',
      qs: opts
    }, transform, callback)
  })
}

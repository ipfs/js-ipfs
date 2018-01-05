'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    id: res.Id,
    name: res.Name
  })
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'key/gen',
      args: args,
      qs: opts
    }, transform, callback)
  })
}

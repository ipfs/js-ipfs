'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    name: res.Name,
    value: res.Value
  })
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'name/publish',
      args: args,
      qs: opts
    }, transform, callback)
  })
}

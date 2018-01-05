'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, res.Path)
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'name/resolve',
      args: args,
      qs: opts
    }, transform, callback)
  })
}

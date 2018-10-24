'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    canceled: res.Canceled === undefined || res.Canceled === true
  })
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'name/pubsub/cancel',
      args: args,
      qs: opts
    }, transform, callback)
  })
}

'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, res.Strings || [])
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'name/pubsub/subs',
      qs: opts
    }, transform, callback)
  })
}

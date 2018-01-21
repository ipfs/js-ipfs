'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, res.Entries.map((entry) => {
    return {
      name: entry.Name,
      type: entry.Type,
      size: entry.Size,
      hash: entry.Hash
    }
  }))
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    return send.andTransform({
      path: 'files/ls',
      args: args,
      qs: opts
    }, transform, callback)
  })
}

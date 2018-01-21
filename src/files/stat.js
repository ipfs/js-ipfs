'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    type: res.Type,
    blocks: res.Blocks,
    size: res.Size,
    hash: res.Hash,
    cumulativeSize: res.CumulativeSize
  })
}

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    send.andTransform({
      path: 'files/stat',
      args: args,
      qs: opts
    }, transform, callback)
  })
}
